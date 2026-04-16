pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
    string(name: 'AWS_REGION', defaultValue: 'us-east-1', description: 'AWS region for ECR/EKS')
    string(name: 'AWS_ACCOUNT_ID', defaultValue: '', description: '12-digit AWS account ID')
    string(name: 'ECR_REPO_WEB', defaultValue: 'devstore-web', description: 'ECR repository name for web image')
    string(name: 'ECR_REPO_API', defaultValue: 'devstore-api', description: 'ECR repository name for api image')
    string(name: 'EKS_CLUSTER_NAME', defaultValue: 'devstore-eks', description: 'Target EKS cluster name')
    string(name: 'K8S_NAMESPACE', defaultValue: 'default', description: 'Kubernetes namespace')
    string(name: 'K8S_WEB_DEPLOYMENT', defaultValue: 'devstore-web', description: 'Web deployment name in EKS')
    string(name: 'K8S_API_DEPLOYMENT', defaultValue: 'devstore-api', description: 'API deployment name in EKS')
    string(name: 'K8S_WEB_CONTAINER', defaultValue: 'web', description: 'Container name in web deployment')
    string(name: 'K8S_API_CONTAINER', defaultValue: 'api', description: 'Container name in api deployment')
  }

  environment {
    IMAGE_TAG = "${env.GIT_COMMIT?.take(7) ?: 'manual'}"
    ECR_REGISTRY = "${params.AWS_ACCOUNT_ID}.dkr.ecr.${params.AWS_REGION}.amazonaws.com"
    WEB_IMAGE = "${params.AWS_ACCOUNT_ID}.dkr.ecr.${params.AWS_REGION}.amazonaws.com/${params.ECR_REPO_WEB}"
    API_IMAGE = "${params.AWS_ACCOUNT_ID}.dkr.ecr.${params.AWS_REGION}.amazonaws.com/${params.ECR_REPO_API}"
  }

  stages {
    stage('Validate inputs') {
      steps {
        script {
          if (!params.AWS_ACCOUNT_ID?.trim()) {
            error('AWS_ACCOUNT_ID is required')
          }
        }
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build images') {
      steps {
        sh '''
          set -euo pipefail

          docker build -f docker/web.Dockerfile -t "$WEB_IMAGE:$IMAGE_TAG" -t "$WEB_IMAGE:latest" .
          docker build -f docker/api.Dockerfile -t "$API_IMAGE:$IMAGE_TAG" -t "$API_IMAGE:latest" .
        '''
      }
    }

    stage('Login to ECR') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins']
        ]) {
          sh '''
            set -euo pipefail

            aws --version
            aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"
          '''
        }
      }
    }

    stage('Ensure ECR repos exist') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins']
        ]) {
          sh '''
            set -euo pipefail

            aws ecr describe-repositories --region "$AWS_REGION" --repository-names "$ECR_REPO_WEB" >/dev/null 2>&1 || \
              aws ecr create-repository --region "$AWS_REGION" --repository-name "$ECR_REPO_WEB" >/dev/null

            aws ecr describe-repositories --region "$AWS_REGION" --repository-names "$ECR_REPO_API" >/dev/null 2>&1 || \
              aws ecr create-repository --region "$AWS_REGION" --repository-name "$ECR_REPO_API" >/dev/null
          '''
        }
      }
    }

    stage('Push images') {
      steps {
        sh '''
          set -euo pipefail

          docker push "$WEB_IMAGE:$IMAGE_TAG"
          docker push "$WEB_IMAGE:latest"
          docker push "$API_IMAGE:$IMAGE_TAG"
          docker push "$API_IMAGE:latest"
        '''
      }
    }

    stage('Deploy to EKS') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins']
        ]) {
          sh '''
            set -euo pipefail

            aws eks update-kubeconfig --region "$AWS_REGION" --name "$EKS_CLUSTER_NAME"

            kubectl -n "$K8S_NAMESPACE" set image deployment/"$K8S_WEB_DEPLOYMENT" "$K8S_WEB_CONTAINER"="$WEB_IMAGE:latest"
            kubectl -n "$K8S_NAMESPACE" set image deployment/"$K8S_API_DEPLOYMENT" "$K8S_API_CONTAINER"="$API_IMAGE:latest"

            kubectl -n "$K8S_NAMESPACE" rollout status deployment/"$K8S_WEB_DEPLOYMENT" --timeout=180s
            kubectl -n "$K8S_NAMESPACE" rollout status deployment/"$K8S_API_DEPLOYMENT" --timeout=180s
          '''
        }
      }
    }
  }

  post {
    success {
      echo "Deployment completed. Pushed tags: latest and ${IMAGE_TAG}"
    }
    always {
      sh 'docker image prune -f || true'
    }
  }
}
pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
  }

  environment {
    REGISTRY = 'ghcr.io'
    IMAGE_NAMESPACE = "${env.IMAGE_NAMESPACE ?: 'your-org-or-user/devstore'}"
    APP_RELEASE = "${env.APP_RELEASE ?: 'v3'}"
    WEB_IMAGE = "${REGISTRY}/${IMAGE_NAMESPACE}/devstore-web"
    API_IMAGE = "${REGISTRY}/${IMAGE_NAMESPACE}/devstore-api"
    IMAGE_TAG = "${env.BUILD_TAG?.replaceAll('[^a-zA-Z0-9_.-]','-') ?: "build-${env.BUILD_NUMBER}"}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install + Lint') {
      steps {
        sh '''
          set -eux
          npm ci --no-fund --no-audit
          npx prisma generate
          npm run lint
        '''
      }
    }

    stage('Build API') {
      steps {
        dir('services/api') {
          sh '''
            set -eux
            npm ci --no-fund --no-audit
            npm run build
          '''
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        sh '''
          set -eux
          docker build -f docker/web.Dockerfile \
            --build-arg NEXT_PUBLIC_API_URL= \
            --build-arg APP_RELEASE=${APP_RELEASE} \
            -t ${WEB_IMAGE}:${IMAGE_TAG} \
            -t ${WEB_IMAGE}:latest \
            .

          docker build -f docker/api.Dockerfile \
            -t ${API_IMAGE}:${IMAGE_TAG} \
            -t ${API_IMAGE}:latest \
            .
        '''
      }
    }

    stage('Push Docker Images') {
      when {
        anyOf {
          tag pattern: "v.*", comparator: "REGEXP"
          branch 'main'
          branch 'master'
        }
      }
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'ghcr-creds',
          usernameVariable: 'REGISTRY_USER',
          passwordVariable: 'REGISTRY_PASS'
        )]) {
          sh '''
            set -eux
            echo "${REGISTRY_PASS}" | docker login ${REGISTRY} -u "${REGISTRY_USER}" --password-stdin
            docker push ${WEB_IMAGE}:${IMAGE_TAG}
            docker push ${WEB_IMAGE}:latest
            docker push ${API_IMAGE}:${IMAGE_TAG}
            docker push ${API_IMAGE}:latest
            docker logout ${REGISTRY}
          '''
        }
      }
    }
  }

  post {
    always {
      sh '''
        docker image prune -f || true
      '''
    }
  }
}
