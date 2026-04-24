pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
    string(name: 'AWS_REGION', defaultValue: 'ap-southeast-2')
    string(name: 'AWS_ACCOUNT_ID', defaultValue: '517355797272')
    string(name: 'ECR_REPO_WEB', defaultValue: 'devstore-web')
    string(name: 'ECR_REPO_API', defaultValue: 'devstore-api')
    string(name: 'EKS_CLUSTER_NAME', defaultValue: 'devstore-eks')
    string(name: 'K8S_NAMESPACE', defaultValue: 'default')
    string(name: 'K8S_WEB_DEPLOYMENT', defaultValue: 'devstore-web')
    string(name: 'K8S_API_DEPLOYMENT', defaultValue: 'devstore-api')
    string(name: 'K8S_WEB_CONTAINER', defaultValue: 'web')
    string(name: 'K8S_API_CONTAINER', defaultValue: 'api')
  }

  environment {
    IMAGE_TAG = "${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : "build-${env.BUILD_NUMBER}"}"
    ECR_REGISTRY = "${params.AWS_ACCOUNT_ID}.dkr.ecr.${params.AWS_REGION}.amazonaws.com"
    WEB_IMAGE = "${ECR_REGISTRY}/${params.ECR_REPO_WEB}"
    API_IMAGE = "${ECR_REGISTRY}/${params.ECR_REPO_API}"
  }

  stages {

    stage('Checkout Code') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Images') {
      steps {
        sh '''
          set -e
          docker build -f docker/web.Dockerfile -t $WEB_IMAGE:$IMAGE_TAG .
          docker build -f docker/api.Dockerfile -t $API_IMAGE:$IMAGE_TAG .
        '''
      }
    }

    stage('Login to AWS ECR') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins']
        ]) {
          sh '''
            aws ecr get-login-password --region $AWS_REGION | \
            docker login --username AWS --password-stdin $ECR_REGISTRY
          '''
        }
      }
    }

    stage('Push Images') {
      steps {
        sh '''
          docker push $WEB_IMAGE:$IMAGE_TAG
          docker push $API_IMAGE:$IMAGE_TAG
        '''
      }
    }

    stage('Deploy to EKS') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins']
        ]) {
          sh '''
            aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER_NAME

            kubectl set image deployment/$K8S_WEB_DEPLOYMENT \
              $K8S_WEB_CONTAINER=$WEB_IMAGE:$IMAGE_TAG -n $K8S_NAMESPACE

            kubectl set image deployment/$K8S_API_DEPLOYMENT \
              $K8S_API_CONTAINER=$API_IMAGE:$IMAGE_TAG -n $K8S_NAMESPACE

            kubectl rollout status deployment/$K8S_WEB_DEPLOYMENT -n $K8S_NAMESPACE
            kubectl rollout status deployment/$K8S_API_DEPLOYMENT -n $K8S_NAMESPACE
          '''
        }
      }
    }

    stage('Seed Database') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins']
        ]) {
          sh '''
            aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER_NAME

            echo "Running Prisma seed inside API pod..."

            kubectl exec deployment/$K8S_API_DEPLOYMENT -n $K8S_NAMESPACE -- \
              npx prisma db seed
          '''
        }
      }
    }

  }

  post {
    success {
      echo "✅ Deployment Successful - ${IMAGE_TAG}"
    }

    failure {
      echo "❌ Deployment Failed"
    }

    always {
      sh 'docker image prune -f || true'
    }
  }
}