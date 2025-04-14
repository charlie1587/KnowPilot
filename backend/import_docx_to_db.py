"""
import_docx_to_db.py - Extracts structured data from a Word .docx file
and stores it into the SQLite database using SQLAlchemy.
"""
from docx import Document
from backend.database import SessionLocal
from backend.models import Question

def load_questions_from_docx(docx_path):
    doc = Document(docx_path)
    session = SessionLocal()

    section = "Unknown Section"
    table_index = 0
    total_tables = len(doc.tables)

    print("Importing from:", docx_path)

    for block in doc.element.body:
        if block.tag.endswith('}p'):
            text = ''.join(t.text for t in block.iter() if t.tag.endswith('}t')).strip()
            if text.lower().startswith("section"):
                section = text  
                print(f"Found section: {section}")

        elif block.tag.endswith('}tbl') and table_index < total_tables:
            table = doc.tables[table_index]
            table_index += 1

            for i, row in enumerate(table.rows):
                if i == 0:
                    continue  # skip header

                try:
                    seq = row.cells[0].text.strip()
                    page_name = row.cells[1].text.strip()
                    audio_file = row.cells[2].text.strip()
                    content = row.cells[3].text.strip()

                    if not content:
                        continue

                    q = Question(
                        section=section,
                        seq=seq,
                        page_name=page_name,
                        audio_file=audio_file,
                        content=content,
                        answer="To be added"
                    )
                    session.add(q)
                except Exception as e:
                    print(f"Error parsing row {i} in table {table_index}: {e}")

    session.commit()
    session.close()
    print("Import complete.")

if __name__ == "__main__":
    load_questions_from_docx("data/Thunderstorm Avoidance_Boeing 20250210.docx")
