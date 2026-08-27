package com.wexa.ecommerce.service;

import com.wexa.ecommerce.domain.Product;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Record;
import org.neo4j.driver.Session;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ProductService {
    private final Driver driver;

    public ProductService(Driver driver) {
        this.driver = driver;
    }

    public List<Product> getAllProducts() {
        if (driver == null) return List.of();
        try (Session session = driver.session()) {
            return session.run("MATCH (p:Product) OPTIONAL MATCH (p)-[:BELONGS_TO]->(c:Category) RETURN p, coalesce(c.name, 'Uncategorized') AS category")
                .list(this::mapToProduct);
        } catch (Exception e) {
            e.printStackTrace();
            return List.of(); // Graceful error handling
        }
    }

    public Product getProductById(String id) {
        if (driver == null) return null;
        try (Session session = driver.session()) {
            var result = session.run("MATCH (p:Product {id: $id}) OPTIONAL MATCH (p)-[:BELONGS_TO]->(c:Category) RETURN p, coalesce(c.name, 'Uncategorized') AS category", Map.of("id", id));
            if (result.hasNext()) {
                return mapToProduct(result.single());
            }
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<Product> getRecommendations(String productId) {
        if (driver == null) return List.of();
        // Multi-hop traversal: Users who bought this also bought...
        String query = """
            MATCH (p:Product {id: $id})<-[:CONTAINS]-(:Order)<-[:PLACED]-(u:User)-[:PLACED]->(:Order)-[:CONTAINS]->(rec:Product)
            WHERE rec.id <> $id
            MATCH (rec)-[:BELONGS_TO]->(c:Category)
            RETURN rec AS p, c.name AS category, count(rec) AS score
            ORDER BY score DESC
            LIMIT 5
        """;
        try (Session session = driver.session()) {
            return session.run(query, Map.of("id", productId))
                .list(this::mapToProduct);
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public void addProduct(Product product) {
        if (driver == null) return;
        String cypher = """
            MERGE (c:Category {name: $category})
            CREATE (p:Product {id: $id, name: $name, description: $desc, price: $price, imageUrl: $imageUrl, stock: $stock})
            CREATE (p)-[:BELONGS_TO]->(c)
        """;
        try (Session session = driver.session()) {
            session.run(cypher, Map.of(
                "id", java.util.UUID.randomUUID().toString(),
                "name", product.name(),
                "desc", product.description(),
                "price", product.price(),
                "imageUrl", product.imageUrl() != null ? product.imageUrl() : "https://via.placeholder.com/200",
                "stock", product.stock(),
                "category", product.category() != null ? product.category() : "Uncategorized"
            ));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void updateProduct(String id, Product product) {
        if (driver == null) return;
        String cypher = """
            MATCH (p:Product {id: $id})
            OPTIONAL MATCH (p)-[r:BELONGS_TO]->(:Category)
            DELETE r
            WITH p
            MERGE (c:Category {name: $category})
            MERGE (p)-[:BELONGS_TO]->(c)
            SET p.name = $name, p.description = $desc, p.price = $price, p.imageUrl = $imageUrl, p.stock = $stock
        """;
        try (Session session = driver.session()) {
            session.run(cypher, Map.of(
                "id", id,
                "name", product.name(),
                "desc", product.description(),
                "price", product.price(),
                "imageUrl", product.imageUrl() != null ? product.imageUrl() : "https://via.placeholder.com/200",
                "stock", product.stock(),
                "category", product.category() != null ? product.category() : "Uncategorized"
            ));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void deleteProduct(String id) {
        if (driver == null) return;
        try (Session session = driver.session()) {
            session.run("MATCH (p:Product {id: $id}) DETACH DELETE p", Map.of("id", id));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private Product mapToProduct(Record record) {
        var node = record.get("p").asNode();
        return new Product(
            node.get("id").asString(),
            node.get("name").asString(),
            node.get("description").asString(),
            node.get("price").asDouble(),
            node.get("imageUrl").asString(null),
            record.get("category").asString(null),
            node.containsKey("stock") ? node.get("stock").asInt() : 0
        );
    }
}
