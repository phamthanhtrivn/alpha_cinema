package com.movieticket.product.repository;

import com.movieticket.product.entity.Product;
import com.movieticket.product.enums.ProductType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    boolean existsByNameAndUnitPrice(String name, double unitPrice);

    boolean existsByNameAndUnitPriceAndIdNot(String name, double unitPrice, String id);

    @Query("SELECT p " +
            "FROM Product p " +
            "WHERE (:id IS NULL OR p.id = :id)" +
            "AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name,'%')) ) " +
            "AND (:minPrice IS NULL OR p.unitPrice >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.unitPrice <= :maxPrice) " +
            "AND (:type IS NULL OR p.type = :type)" +
            "AND (:status IS NULL OR p.status = :status)")
    Page<Product> filterProducts(
            @Param("id") String id,
            @Param("name") String name,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("type") ProductType type,
            @Param("status") Boolean status,
            Pageable pageable
    );
}
