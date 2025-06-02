resource "aws_security_group" "rabbitmq_sg" {
  name   = "rabbitmq-sg"
  vpc_id = var.vpc_id

  ingress {
    from_port = 0
    to_port   = 0
    protocol = "-1"
    self     = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "rabbitmq-sg"
  }
}
