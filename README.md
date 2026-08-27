# WexaShop - E-Commerce Graph Database Application

WexaShop is a modern e-commerce application backed by a graph database (CognoDB) to demonstrate the power of graph relationships in delivering real-time product recommendations.

## Why a Graph Database?
In a traditional relational database, generating a "Customers who bought this also bought" recommendation requires expensive self-joins and aggregations across multiple tables (Users, Orders, OrderItems, Products). This becomes notoriously slow as the dataset grows. 

A graph database natively models these relationships. The query traverses the graph across multiple hops: `Product <- Order <- User -> Order -> Product` in milliseconds. Graph databases naturally excel at recommendation engines because the relationships between entities are stored as first-class citizens.

## Data Model

- **Nodes:** `User`, `Product`, `Category`, `Order`
- **Relationships:** 
  - `(User)-[:PLACED]->(Order)`
  - `(Order)-[:CONTAINS]->(Product)`
  - `(Product)-[:BELONGS_TO]->(Category)`

## Setup & Run Instructions

### 1. CognoDB Setup
1. Create a free (c0) instance at [CognoDB Cloud](https://console.cognodb.com).
2. Note your connection URI (`bolt+s://<instance-id>...`) and the generated password.
3. In the `backend` directory, create a `.env` file from the `.env.example`:
   ```bash
   COGNODB_URI=bolt+s://<your-instance>.databases.cognodb.cloud
   COGNODB_USER=cognodb
   COGNODB_PASSWORD=<your-password>
   ```

### 2. Backend (Spring Boot)
Requires Java 21 and Maven.
1. `cd backend`
2. `mvn spring-boot:run`
*Note: The application will automatically seed the database with sample data on startup.*

### 3. Frontend (React + Vite)
Requires Node.js.
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Main Queries Explained

**Multi-hop Recommendation (Collaborative Filtering)**
```cypher
MATCH (p:Product {id: $id})<-[:CONTAINS]-(:Order)<-[:PLACED]-(u:User)-[:PLACED]->(:Order)-[:CONTAINS]->(rec:Product)
WHERE rec.id <> $id
MATCH (rec)-[:BELONGS_TO]->(c:Category)
RETURN rec AS p, c.name AS category, count(rec) AS score
ORDER BY score DESC
LIMIT 5
```
*How it works: It starts at the currently viewed product (`p`), finds the orders containing it, traces back to the users who placed those orders, traverses to other orders those users placed, and finally finds the other products (`rec`) in those orders.*
