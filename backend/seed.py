import json
from datetime import datetime
from pathlib import Path


STUDENT_DETAILS_PATH = Path(__file__).with_name("student_details.json")


def load_student_rows() -> list[dict[str, str | None]]:
    with STUDENT_DETAILS_PATH.open(encoding="utf-8") as file:
        students = json.load(file)

    if not isinstance(students, list):
        raise ValueError("student_details.json must contain a list of students")

    rows = []
    for index, student in enumerate(students, start=1):
        try:
            row = {
                "name": student["name"],
                "usn": student["usn"],
                "dob": datetime.strptime(student["dob"], "%d/%m/%Y")
                .date()
                .isoformat(),
                "phone_no": student.get("mobile"),
                "dept": "AIML",
            }
        except (KeyError, TypeError, ValueError) as error:
            raise ValueError(
                f"Invalid student record at position {index}"
            ) from error
        rows.append(row)

    return rows


def seed() -> None:
    from config import supabase

    rows = load_student_rows()
    if not rows:
        print("No student records found to seed.")
        return

    usns = [row["usn"] for row in rows]
    existing_result = (
        supabase.table("student").select("usn").in_("usn", usns).execute()
    )
    existing_usns = {
        student["usn"] for student in (existing_result.data or [])
    }
    rows_to_insert = [row for row in rows if row["usn"] not in existing_usns]

    if not rows_to_insert:
        print(f"All {len(rows)} students already exist; nothing was inserted.")
        return

    result = (
        supabase.table("student")
        .insert(rows_to_insert)
        .select("id")
        .execute()
    )
    inserted_count = len(result.data or [])
    if inserted_count != len(rows_to_insert):
        raise RuntimeError(
            f"Expected to insert {len(rows_to_insert)} students, "
            f"but Supabase returned {inserted_count} rows."
        )

    skipped_count = len(rows) - len(rows_to_insert)
    print(
        f"Inserted {inserted_count} students; "
        f"skipped {skipped_count} existing USNs."
    )


if __name__ == "__main__":
    seed()
