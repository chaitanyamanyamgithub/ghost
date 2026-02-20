pipeline {
    agent none

    stages {

        stage('Install Dependencies') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-u root:root'
                }
            }
            steps {
                sh '''
                  node --version
                  npm --version
                  npm install
                '''
            }
        }

        stage('Build Project') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-u root:root'
                }
            }
            steps {
                sh '''
                  npm run build
                '''
            }
        }

        stage('Run Dev Server') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-u root:root'
                }
            }
            steps {
                sh '''
                  npm run dev &
                  sleep 10
                '''
            }
        }

        stage('Clean Docker Images') {
            agent any
            steps {
                sh '''
                  docker system prune -af
                '''
            }
        }
    }

    post {
        always {
            echo "Pipeline Finished"
        }
        success {
            echo "Build Successful"
        }
        failure {
            echo "Build Failed"
        }
    }
}
