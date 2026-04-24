pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
    string(name: 'AWS_REGION', defaultValue: 'ap-southeast-2', description: 'AWS region')
    string(name: 'AWS_ACCOUNT_ID', defaultValue: '517355797272', description: 'AWS account ID')
    string(name: 'ECR_REPO_WEB', defaultValue: 'devstore-web', description: 'Web repo name')
    string(name: 'ECR_REPO_API', defaultValue: 'devstore-api', description: 'API repo name')
    string(name: 'EKS_CLUSTER_NAME', defaultValue: 'devstore-eks', description: 'EKS cluster name')
    string(name: 'K8S_NAMESPACE', defaultValue: 'default', description: 'K8s namespace')
    string(name: 'K8S_WEB_DEPLOYMENT', defaultValue: 'devstore-web', description: 'Web deployment')
    string(name: 'K8S_API_DEPLOYMENT', defaultValue: 'devstore-api', description: 'API deployment')
    string(name: 'K8S_WEB_CONTAINER', defaultValue: 'web', description: 'Web container name')
    string(name: 'K8S_API_CONTAINER', defaultValue: 'api', description: 'API container name')
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

          echo "Building Web Image..."
          docker build -f docker/web.Dockerfile \
            -t $WEB_IMAGE:$IMAGE_TAG \
            -t $WEB_IMAGE:latest .

          echo "Building API Image..."
          docker build -f docker/api.Dockerfile \
            -t $API_IMAGE:$IMAGE_TAG \
            -t $API_IMAGE:latest .
        '''
      }
    }

    stage('Login to AWS ECR') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins']
        ]) {
          sh '''
            set -e

            aws sts get-caller-identity

            aws ecr get-login-password --region $AWS_REGION | \
            docker login --username AWS --password-stdin $ECR_REGISTRY
          '''
        }
      }
    }

    stage('Push Images to ECR') {
      steps {
        sh '''
          set -e

          echo "Pushing Web Image..."
          docker push $WEB_IMAGE:$IMAGE_TAG
          docker push $WEB_IMAGE:latest

          echo "Pushing API Image..."
          docker push $API_IMAGE:$IMAGE_TAG
          docker push $API_IMAGE:latest
        '''
      }
    }

    stage('Deploy to EKS') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins']
        ]) {
          sh '''
            set -e

            echo "Updating kubeconfig..."
            aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER_NAME

            echo "Ensuring namespace exists..."
            kubectl get ns $K8S_NAMESPACE || kubectl create ns $K8S_NAMESPACE

            echo "Applying Kubernetes manifests (if any)..."
            if [ -d "k8s" ]; then
              kubectl apply -f k8s/ -n $K8S_NAMESPACE
            fi

            echo "Updating Web Deployment Image..."
            kubectl set image deployment/$K8S_WEB_DEPLOYMENT \
              $K8S_WEB_CONTAINER=$WEB_IMAGE:$IMAGE_TAG \
              -n $K8S_NAMESPACE

            echo "Updating API Deployment Image..."
            kubectl set image deployment/$K8S_API_DEPLOYMENT \
              $K8S_API_CONTAINER=$API_IMAGE:$IMAGE_TAG \
              -n $K8S_NAMESPACE

            echo "Waiting for rollout..."
            kubectl rollout status deployment/$K8S_WEB_DEPLOYMENT -n $K8S_NAMESPACE --timeout=180s || exit 1
            kubectl rollout status deployment/$K8S_API_DEPLOYMENT -n $K8S_NAMESPACE --timeout=180s || exit 1
          '''
        }
      }
    }
  }

  post {
    success {
      echo "✅ Deployment Successful - Tag: ${IMAGE_TAG}"
    }

    failure {
      echo "❌ Deployment Failed"
    }

    always {
      sh 'docker image prune -f || true'
    }
  }
}