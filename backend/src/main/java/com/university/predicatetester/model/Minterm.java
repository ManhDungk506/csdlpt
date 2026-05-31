package com.university.predicatetester.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Minterm {
    private String id;
    private List<Predicate> predicates; // The predicates that make up this minterm
    private Map<String, Boolean> predicateSigns; // true if positive, false if negated (e.g. p1: true, p2: false)
    private String text; // e.g. "p1 AND NOT p2"

    public boolean evaluate(Student student) {
        for (Predicate p : predicates) {
            boolean sign = predicateSigns.get(p.getId());
            boolean result = p.evaluate(student);
            if (sign && !result) return false;
            if (!sign && result) return false;
        }
        return true;
    }
}
