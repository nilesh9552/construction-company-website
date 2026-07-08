# Construction Company Website

This project provides:
- A modern construction business landing page
- An admin page for uploading project photos and videos
- A Java Spring Boot backend with a simple H2 database

## Run
1. Install JDK 17+
2. Run: mvn spring-boot:run
3. Open: http://localhost:8080/
4. Admin page: http://localhost:8080/admin.html

## Production
1. Set `SPRING_PROFILES_ACTIVE=prod`.
2. By default, production uses a persistent H2 file database under `/var/data` so the app can start on Render without a separate database service.
3. Set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, and `SPRING_JPA_DATABASE_PLATFORM` if you want to switch production to PostgreSQL.
4. Set `APP_UPLOAD_DIR` to a persistent folder such as `/var/data/uploads`.
5. Build the container with `docker build -t construction-company-website .`.
6. Run it with port `8080` exposed and persistent storage mounted at `/var/data`.

## Deploy on Render
1. Push this repo to GitHub.
2. Create a new Render Web Service from the repo.
3. Set the build command to `mvn clean package -DskipTests`.
4. Set the start command to `java -jar target/construction-company-website-1.0.0.jar`.
5. Set `SPRING_PROFILES_ACTIVE=prod`.
6. Set `APP_UPLOAD_DIR=/var/data/uploads` and mount persistent storage at `/var/data`.
7. If you add a Render PostgreSQL database later, set the datasource and JPA env vars too.
8. The app listens on Render's `PORT` automatically.
9. After deploy, open the Render URL and test the home page, projects page, contact form, and admin panel.

## Notes
- The current setup uses H2 for quick local development.
- To switch to MySQL later, provide the datasource environment variables and change the production profile if needed.
- Uploaded project images and visit data should live on persistent storage in production.
cd c:\Users\Nilesh\Desktop\construction-company-website
mvn spring-boot:run



