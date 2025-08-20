const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/batch-gpa", async (req, res) => {
  const { year, semester } = req.query;

  // If year and semester are provided, validate them
  if (year && semester) {
    const validSemesters = ["Fall", "Spring", "Summer"];
    const validYear = parseInt(year);
    if (
      !validYear ||
      validYear < 1952 ||
      validYear > 1971 ||
      !validSemesters.includes(semester)
    ) {
      return res.status(400).send("Invalid batch year or semester.");
    }

    try {
      const result = await db.query(
        `
        WITH total_marks AS (
          SELECT regno, rid, SUM(obtained) AS total_obtained, SUM(total) AS total_possible
          FROM (
            SELECT m.regno, m.rid, m.marks AS obtained, d.total
            FROM marks m
            JOIN dist d ON m.hid = d.hid AND m.rid = d.rid
            UNION ALL
            SELECT cm.regno, cm.rid, cm.marks AS obtained, cd.total
            FROM cmarks cm
            JOIN cdist cd ON cm.hid = cd.hid AND cm.rid = cd.rid
          ) AS all_marks
          GROUP BY regno, rid
        ),
        gpa_per_course AS (
          SELECT 
            tm.regno,
            tm.rid,
            (tm.total_obtained::decimal / tm.total_possible::decimal) * 100 AS percentage,
            g.gpa
          FROM total_marks tm
          JOIN grade g 
            ON (tm.total_obtained::decimal / tm.total_possible::decimal) * 100 BETWEEN g.start AND g."end"
           AND g.version = 1
        ),
        student_semester_gpa AS (
          SELECT 
            gpc.regno,
            r.semester,
            r."year"::int AS batch_year,
            AVG(gpc.gpa) AS semester_gpa
          FROM gpa_per_course gpc
          JOIN recap r ON gpc.rid = r.rid
          GROUP BY gpc.regno, r.semester, r."year"
        )
        SELECT 
          batch_year,
          semester,
          ROUND(AVG(semester_gpa), 2) AS batch_avg_gpa,
          COUNT(DISTINCT regno) AS student_count
        FROM student_semester_gpa
        WHERE batch_year = $1 AND semester = $2
        GROUP BY batch_year, semester
        ORDER BY batch_year, semester;
        `,
        [validYear, semester]
      );

      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching batch GPA:", error.message);
      res.status(500).send("Failed to retrieve batch GPA data.");
    }
  } else {
    // If no filters — return all batch GPA data from 1952 to 1971
    try {
      const result = await db.query(
        `
        WITH total_marks AS (
          SELECT regno, rid, SUM(obtained) AS total_obtained, SUM(total) AS total_possible
          FROM (
            SELECT m.regno, m.rid, m.marks AS obtained, d.total
            FROM marks m
            JOIN dist d ON m.hid = d.hid AND m.rid = d.rid
            UNION ALL
            SELECT cm.regno, cm.rid, cm.marks AS obtained, cd.total
            FROM cmarks cm
            JOIN cdist cd ON cm.hid = cd.hid AND cm.rid = cd.rid
          ) AS all_marks
          GROUP BY regno, rid
        ),
        gpa_per_course AS (
          SELECT 
            tm.regno,
            tm.rid,
            (tm.total_obtained::decimal / tm.total_possible::decimal) * 100 AS percentage,
            g.gpa
          FROM total_marks tm
          JOIN grade g 
            ON (tm.total_obtained::decimal / tm.total_possible::decimal) * 100 BETWEEN g.start AND g."end"
           AND g.version = 1
        ),
        student_semester_gpa AS (
          SELECT 
            gpc.regno,
            r.semester,
            r."year"::int AS batch_year,
            AVG(gpc.gpa) AS semester_gpa
          FROM gpa_per_course gpc
          JOIN recap r ON gpc.rid = r.rid
          GROUP BY gpc.regno, r.semester, r."year"
        )
        SELECT 
          batch_year,
          semester,
          ROUND(AVG(semester_gpa), 2) AS batch_avg_gpa,
          COUNT(DISTINCT regno) AS student_count
        FROM student_semester_gpa
        WHERE batch_year BETWEEN 1952 AND 1971
        GROUP BY batch_year, semester
        ORDER BY batch_year, semester;
        `
      );

      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching all batch GPA:", error.message);
      res.status(500).send("Failed to retrieve batch GPA data.");
    }
  }
});

module.exports = router;
