# ========================================================
# SINGLE FILE TERRAFORM - ECR + EKS for devstore app
# Perfect for your Jenkins CI/CD pipeline
# ========================================================

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ====================== VARIABLES ======================
variable "region" {
  description = "AWS Region"
  type        = string
  default     = "ap-southeast-2"
}

variable "cluster_name" {
  description = "EKS Cluster Name"
  type        = string
  default     = "devstore-eks"
}

variable "ecr_repo_web" {
  description = "ECR repo for web frontend"
  type        = string
  default     = "devstore-web"
}

variable "ecr_repo_api" {
  description = "ECR repo for backend API"
  type        = string
  default     = "devstore-api"
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
  default     = "dev"
}

# ====================== PROVIDER ======================
provider "aws" {
  region = var.region
}

# ====================== VPC ======================
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.cluster_name}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.region}a", "${var.region}b", "${var.region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true
  enable_dns_support   = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

# ====================== ECR Repositories ======================
resource "aws_ecr_repository" "web" {
  name                 = var.ecr_repo_web
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = var.ecr_repo_web
    Environment = var.environment
  }
}

resource "aws_ecr_repository" "api" {
  name                 = var.ecr_repo_api
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = var.ecr_repo_api
    Environment = var.environment
  }
}

# ====================== EKS Cluster ======================
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.30"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true

  enable_irsa = true

  eks_managed_node_groups = {
    general = {
      name           = "general-ng"
      instance_types = ["t3.medium"]
      min_size       = 2
      max_size       = 4
      desired_size   = 2

      iam_role_additional_policies = {
        AmazonEC2ContainerRegistryReadOnly = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
      }
    }
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

# ====================== OUTPUTS ======================
output "ecr_web_repository_url" {
  description = "Web ECR Repository URL (use in Jenkins)"
  value       = aws_ecr_repository.web.repository_url
}

output "ecr_api_repository_url" {
  description = "API ECR Repository URL (use in Jenkins)"
  value       = aws_ecr_repository.api.repository_url
}

output "eks_cluster_name" {
  description = "EKS Cluster Name (use in Jenkins pipeline)"
  value       = module.eks.cluster_name
}

output "region" {
  description = "AWS Region"
  value       = var.region
}

output "kubeconfig_command" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --region ${var.region} --name ${module.eks.cluster_name}"
}

output "success_message" {
  value = <<EOT

✅ Infrastructure successfully provisioned!

Your Jenkins pipeline is now ready to use:

• ECR_REPO_WEB     = ${var.ecr_repo_web}
• ECR_REPO_API     = ${var.ecr_repo_api}
• EKS_CLUSTER_NAME = ${var.cluster_name}
• AWS_REGION       = ${var.region}

Next Step:
Run this command locally to access the cluster:
${"aws eks update-kubeconfig --region ${var.region} --name ${module.eks.cluster_name}"}

Your deployments will be updated automatically by the Jenkins pipeline.
EOT
}