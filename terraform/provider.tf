# -----------------------------------------------------
# AWS
# -----------------------------------------------------
variable "profile" {
    default = "discordservers"
}

variable "shared_credentials_file" {
    default = "~/.aws/credentials"
}

variable "region" {
    description = "The region to deploy in"
    default     = "us-east-1"
}

provider "aws" {
    region                  = var.region
    shared_credentials_file = var.shared_credentials_file
    profile                 = var.profile
}
