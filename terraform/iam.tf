resource "aws_iam_role" "rabbitmq_role" {
  name = "rabbitmq-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "ec2.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.rabbitmq_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "rabbitmq_profile" {
  name = "rabbitmq-instance-profile"
  role = aws_iam_role.rabbitmq_role.name
}

resource "aws_iam_role_policy" "ec2_resource_access" {
  name = "ec2_resource_access-policy"
  role = aws_iam_role.rabbitmq_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "secretsmanager:GetSecretValue"
        ],
        Resource = [
          aws_secretsmanager_secret.rabbitmq_monitoring_credentials.arn,
          aws_secretsmanager_secret.rabbitmq_credentials.arn
        ]
      },
      {
        Effect = "Allow",
        Action = [
          "cloudwatch:PutMetricData",
          "autoscaling:DescribeAutoScalingInstances",
          "ec2:DescribeInstances"
        ],
        Resource = "*"
      }
    ]
  })
}