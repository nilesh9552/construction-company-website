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

## Deploy on Render
1. Push this repo to GitHub.
2. Create a new Render Web Service from the repo.
3. Render will use `render.yaml` with Java 17, `mvn clean package -DskipTests`, and `java -jar target/construction-company-website-1.0.0.jar`.
4. The app listens on Render's `PORT` automatically.
5. After deploy, open the Render URL and test the home page, projects page, and admin panel.
6. Render mounts persistent data at `/var/data`, so project uploads and the H2 database survive restarts.

## Notes
- The current setup uses H2 for quick local development.
- To switch to MySQL later, update `src/main/resources/application.properties` with your DB connection details.
- Uploaded project images are stored on the Render instance filesystem. If you need uploads to survive restarts, add persistent storage or move uploads to cloud storage later.
cd c:\Users\Nilesh\Desktop\construction-company-website
mvn spring-boot:run





