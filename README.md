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


### 3. Frontend (React + Vite)
Requires Node.js.
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Optional: Seed Sample Data (Cypher)
If you want to manually seed your database with sample products and categories for testing, you can run this query directly in the CognoDB Cloud console (or any Neo4j client):

```cypher
// Clear existing data
MATCH (n) DETACH DELETE n;

// Create Categories
CREATE (cElectronics:Category {name: 'Electronics'})
CREATE (cApparel:Category {name: 'Apparel'})

// Create Products
CREATE (p1:Product {id: 'p1', name: 'Wireless Headphones', price: 199.99, stock: 50, imageUrl: 'https://via.placeholder.com/200', description: 'Noise cancelling headphones'})
CREATE (p2:Product {id: 'p2', name: 'Smartphone', price: 799.99, stock: 20, imageUrl: 'https://via.placeholder.com/200', description: 'Latest smartphone model'})
CREATE (p3:Product {id: 'p3', name: 'Cotton T-Shirt', price: 25.00, stock: 100, imageUrl: 'https://via.placeholder.com/200', description: 'Comfortable cotton t-shirt'})
CREATE (p4:Product {id: 'p4', name: 'Denim Jeans', price: 60.00, stock: 40, imageUrl: 'https://via.placeholder.com/200', description: 'Classic blue denim jeans'})

// Assign Categories
CREATE (p1)-[:BELONGS_TO]->(cElectronics)
CREATE (p2)-[:BELONGS_TO]->(cElectronics)
CREATE (p3)-[:BELONGS_TO]->(cApparel)
CREATE (p4)-[:BELONGS_TO]->(cApparel);
```

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
