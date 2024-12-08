pipeline{
    agent any

    stages{
        stage("Pull"){
            steps{
                    script{
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: "*/${env.BRANCH_NAME}"]],
                            userRemoteConfigs: [[
                                url: 'https://github.com/BSO-Space/attendify-back.git',
                                credentialsId: '3c91d658-54b4-4606-b119-5fd58aa85b28' 
                            ]]
                        ])
                    }
                }
            post{
                always{
                    echo "Pulling from ${env.BRANCH_NAME}"
                }
                success{
                    echo "Pulled Successfully"
                }
                failure{
                    echo "Pulled Failed"
                }
            }
        }

        stage("Install Dependencies"){
            steps{
                script{
                    sh "npm install && npx prisma generate --schema=./src/prisma/schema.prisma"
                }
            }
            post{
                always{
                    echo "Installing Dependencies"
                }
                success{
                    echo "Installed Successfully"
                }
                failure{
                    echo "Installed Failed"
                }
            }
        }

        stage("Build"){
            steps{
                script{
                    sh "npm run build"
                }
            }
            post{
                always{
                    echo "Building"
                }
                success{
                    echo "Built Successfully"
                }
                failure{
                    echo "Build Failed"
                }
            }
        }

        // stage("Test"){
        //     steps{
        //         script{
        //             sh "npm run test"
        //         }
        //     }
        //     post{
        //         always{
        //             echo "Running Tests"
        //         }
        //         success{
        //             echo "Tests Passed"
        //         }
        //         failure{
        //             echo "Tests Failed"
        //         }
        //     }
        // }

        stage("Deploy"){
            when {
                    anyOf {
                        branch 'main'
                        branch 'release*'
                    }
                }
            steps {
                script {
                    if (params.BRANCH.startsWith('release')) {
                        echo "Deploying using docker-compose.release.yml"
                        sh "docker compose -f docker-compose.release.yml up -d"
                    } else {
                        echo "Deploying using docker-compose.yml"
                        sh "docker compose up -d"
                    }
                }
            }
            post {
                always {
                    echo "Deploying"
                }
                success {
                    echo "Deployment Successful"
                }
                failure {
                    echo "Deployment Failed"
                }
            }
        }
    }
    post{
        success{
            echo "Pipeline execution successful"
        }
        failure{
            echo "Pipeline execution failed"
        }
    }
}