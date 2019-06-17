# Secrets
data "aws_secretsmanager_secret" "database" {
    name = "hotline/database"
}

data "aws_secretsmanager_secret" "apply_database" {
    name = "hotline/apply/database"
}

data "aws_secretsmanager_secret" "discord" {
    name = "hotline/discord"
}
data "aws_secretsmanager_secret" "apply_discord" {
    name = "hotline/apply/discord"
}


# Policy
data "aws_iam_policy_document" "_" {
    statement {
        sid     = "1"
        actions = [
            "secretsmanager:GetSecretValue",
            "secretsmanager:DescribeSecret"
        ]
        effect  = "Allow"

        resources = [
            data.aws_secretsmanager_secret.database.arn,
            data.aws_secretsmanager_secret.apply_database.arn,
            data.aws_secretsmanager_secret.discord.arn,
            data.aws_secretsmanager_secret.apply_discord.arn,
        ]
    }
}

# User
resource "aws_iam_user" "_" {
    name = "apply-hotline-gg"
}

resource "aws_iam_access_key" "_" {
    user = aws_iam_user._.name
}

resource "aws_iam_user_policy" "_" {
    name   = "secrets_manager"
    user   = aws_iam_user._.name
    policy = data.aws_iam_policy_document._.json
}
