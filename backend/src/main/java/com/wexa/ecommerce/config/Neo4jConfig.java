package com.wexa.ecommerce.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.DisposableBean;

@Configuration
public class Neo4jConfig implements DisposableBean {

    private Driver driver;

    @Bean
    public Driver neo4jDriver() {
        // Load from .env file or system environment variables
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String uri = dotenv.get("COGNODB_URI", System.getenv("COGNODB_URI"));
        String user = dotenv.get("COGNODB_USER", System.getenv("COGNODB_USER"));
        if (user == null) user = "cognodb";
        String password = dotenv.get("COGNODB_PASSWORD", System.getenv("COGNODB_PASSWORD"));

        if (uri == null || password == null) {
            System.err.println("WARNING: CognoDB credentials missing. Please set COGNODB_URI and COGNODB_PASSWORD in .env file.");
            // We shouldn't crash here so that it can be built, but it will fail on query.
            return null;
        }

        this.driver = GraphDatabase.driver(uri, AuthTokens.basic(user, password));
        return this.driver;
    }

    @Override
    public void destroy() throws Exception {
        if (driver != null) {
            driver.close();
        }
    }
}
