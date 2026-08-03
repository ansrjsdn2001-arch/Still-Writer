FROM maven:3.9.9-eclipse-temurin-17

WORKDIR /app

# 의존성 다운로드 레이어를 분리해서, 소스 코드만 바뀔 때는 빌드 캐시를 최대한 재사용합니다.
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src

EXPOSE 8080

# 개발용 실행입니다. 운영 배포용은 JAR 빌드 후 java -jar로 실행하는 별도 Dockerfile을 두는 편이 좋습니다.
CMD ["mvn", "spring-boot:run"]
