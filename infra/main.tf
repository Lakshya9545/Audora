provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "audora" {
  ami           = "ami-007855ac798b5175e" # Ubuntu 22.04 us-east-1
  instance_type = "t3.small"
  key_name      = "audora-key"

  vpc_security_group_ids = [aws_security_group.audora.id]

  tags = {
    Name = "audora-prod"
  }
}

resource "aws_security_group" "audora" {
  name = "audora-sg"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_eip" "audora" {
  instance = aws_instance.audora.id
}