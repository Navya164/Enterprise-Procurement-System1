package com.pms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pms.entity.ProcurementCategory;

public interface ProcurementCategoryRepository extends JpaRepository<ProcurementCategory, Long> {

    boolean existsByCategoryCode(String categoryCode);

}