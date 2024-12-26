pipeline {
    agent any

    environment {
        REPO_URL = 'https://github.com/BSO-Space/attendify-back.git'
        WORKSPACE_DIR = "${env.WORKSPACE}" // ยืนยันว่า WORKSPACE ถูกตั้งค่า
    }

    stages {
        stage('Checkout Code') {
            steps {
                script {
                    checkout scm
                }
            }
        }

        stage('Load Environment Variables') {
            when {
                anyOf {
                    branch 'main'
                    branch pattern: 'release/.*'
                }
            }
            steps {
                script {
                    def sourceFile = env.BRANCH_NAME == 'main' 
                        ? '/var/jenkins_home/credential/attendify-back/.env' 
                        : '/var/jenkins_home/credential/attendify-back/.env.release'
                    
                    def destinationFile = env.BRANCH_NAME == 'main' 
                        ? "${WORKSPACE_DIR}/.env" 
                        : "${WORKSPACE_DIR}/.env.release"

                    if (fileExists(sourceFile)) {
                        sh "cp ${sourceFile} ${destinationFile}"
                        echo "Environment file copied to ${destinationFile}"
                    } else {
                        error "Environment file does not exist: ${sourceFile}"
                    }
                }
            }
            post {
                always {
                    echo "Environment variables loaded."
                }
                success {
                    echo "Environment loaded successfully."
                }
                failure {
                    echo "Failed to load environment variables."
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh 'npm ci && npx prisma generate'
                }
            }
            post {
                always {
                    echo "Dependencies installation completed."
                }
                success {
                    echo "Dependencies installed successfully."
                }
                failure {
                    echo "Dependencies installation failed."
                }
            }
        }

        stage('Build Application') {
            steps {
                script {
                    sh 'npm run build'
                }
            }
            post {
                always {
                    echo "Build process completed."
                }
                success {
                    echo "Build successful."
                }
                failure {
                    echo "Build failed."
                }
            }
        }

        stage('Deploy Application') {
            when {
                anyOf {
                    branch 'main'
                    branch pattern: 'release/.*'
                }
            }
            steps {
                script {
                    def composeFile = env.BRANCH_NAME == 'main' 
                        ? 'docker-compose.yml' 
                        : 'docker-compose.release.yml'

                    echo "Deploying using ${composeFile}"
                    sh "docker compose -f ${composeFile} up -d --build"
                }
            }
            post {
                always {
                    echo "Deployment process completed."
                }
                success {
                    echo "Application deployed successfully."
                }
                failure {
                    echo "Deployment failed."
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline execution completed."
        }
        success {
            echo "Pipeline executed successfully."
        }
        failure {
            echo "Pipeline execution failed."
        }
    }
}
