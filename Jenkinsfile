pipeline {
    agent any

    environment {
        REPO_URL = 'https://github.com/BSO-Space/attendify-back.git'
        WORKSPACE_DIR = "${env.WORKSPACE}"
    }

    stages {
        stage('Determine Environment') {
            steps {
                script {
                    if (env.BRANCH_NAME ==~ /release\/.*/) {
                        env.ENVIRONMENT = 'staging'
                        env.ENV_FILE_CREDENTIAL = 'attendify-staging-env-file'
                    } else if (env.BRANCH_NAME == 'main') {
                        env.ENVIRONMENT = 'production'
                        env.ENV_FILE_CREDENTIAL = 'attendify-prod-env-file'
                    } else {
                        env.ENVIRONMENT = 'other'
                        env.ENV_FILE_CREDENTIAL = 'attendify-feature-env-file'
                    }
                }
            }
        }

        stage('Checkout Code') {
            steps {
                checkout scm
            }
            post {
                always {
                    echo "Code checkout completed."
                }
                success {
                    echo "Code checkout successful."
                }
                failure {
                    echo "Code checkout failed."
                }
            }
        }

        stage('Setup .env') {
            steps {
                script {
                    // Load the Secret File and save it as .env
                    withCredentials([file(credentialsId: "${ENV_FILE_CREDENTIAL}", variable: 'SECRET_ENV_FILE')]) {
                        def envFile = env.BRANCH_NAME ==~ /release\/.*/ ? '.env.release' : '.env'
                        sh "cp $SECRET_ENV_FILE ${envFile}"
                        echo "Loaded environment file for ${env.ENVIRONMENT} using ${envFile}."
                    }
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
                not {
                    expression {
                        env.ENVIRONMENT == 'other'
                    }
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
