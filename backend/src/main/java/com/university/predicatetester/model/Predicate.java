package com.university.predicatetester.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Predicate {
    private String id; // e.g. p1
    private String text; // e.g. "GPA > 3.5"
    private String attribute; // "GPA"
    private String operator; // ">"
    private String value; // "3.5"
    
    // Check if a student satisfies this predicate
    public boolean evaluate(Student student) {
        try {
            switch (attribute.toUpperCase()) {
                case "GPA":
                    return evaluateNumeric(student.getGpa(), operator, Double.parseDouble(value));
                case "CREDITS":
                    return evaluateNumeric(student.getCredits(), operator, Double.parseDouble(value));
                case "MAJOR":
                    return evaluateString(student.getMajor(), operator, value.replace("'", "").replace("\"", ""));
                case "YEAR":
                    return evaluateString(student.getYear(), operator, value.replace("'", "").replace("\"", ""));
                default:
                    return false;
            }
        } catch (Exception e) {
            return false;
        }
    }

    private boolean evaluateNumeric(double attrValue, String op, double val) {
        switch (op) {
            case ">": return attrValue > val;
            case "<": return attrValue < val;
            case ">=": return attrValue >= val;
            case "<=": return attrValue <= val;
            case "=": case "==": return attrValue == val;
            case "!=": case "<>": return attrValue != val;
            default: return false;
        }
    }

    private boolean evaluateString(String attrValue, String op, String val) {
        if (op.equals("=") || op.equals("==")) return attrValue.equalsIgnoreCase(val);
        if (op.equals("!=") || op.equals("<>")) return !attrValue.equalsIgnoreCase(val);
        return false;
    }

    public static Predicate parse(String id, String text) {
        text = text.replace("$", "").trim();
        String[] parts = text.split("(?<=<=|>=|!=|==|<|>|=)|(?=<=|>=|!=|==|<|>|=)");
        if (parts.length >= 3) {
            String attr = parts[0].trim();
            String op = parts[1].trim();
            String val = parts[2].trim();
            // sometimes split might be messy if spaces exist, let's do a better parse
            return new Predicate(id, text, attr, op, val);
        }
        
        // Better parser
        String[] tokens = text.split("\\s+");
        if(tokens.length >= 3) {
            String attr = tokens[0];
            String op = tokens[1];
            String val = text.substring(text.indexOf(op) + op.length()).trim();
            return new Predicate(id, text, attr, op, val);
        }
        return new Predicate(id, text, "", "", "");
    }
}
