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

stage('Push Images to ECR') {
  steps {
    retry(3) {
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
        kubectl get ns $K8S_NAMESPACE >/dev/null 2>&1 || \
        kubectl create ns $K8S_NAMESPACE

        echo "Applying manifests..."
        if [ -d "k8s" ]; then
          kubectl apply -f k8s/ -n $K8S_NAMESPACE
        fi

        echo "Updating Web Deployment..."
        kubectl set image deployment/$K8S_WEB_DEPLOYMENT \
          $K8S_WEB_CONTAINER=$WEB_IMAGE:$IMAGE_TAG \
          -n $K8S_NAMESPACE

        echo "Updating API Deployment..."
        kubectl set image deployment/$K8S_API_DEPLOYMENT \
          $K8S_API_CONTAINER=$API_IMAGE:$IMAGE_TAG \
          -n $K8S_NAMESPACE

        echo "Waiting for rollout..."
        kubectl rollout status deployment/$K8S_WEB_DEPLOYMENT -n $K8S_NAMESPACE --timeout=180s
        kubectl rollout status deployment/$K8S_API_DEPLOYMENT -n $K8S_NAMESPACE --timeout=180s
      '''
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