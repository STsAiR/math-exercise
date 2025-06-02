# open p1.pdf and remove page 25 to 40
from PyPDF2 import PdfReader, PdfWriter
def remove_pages(input_pdf, output_pdf, start_page, end_page):
    reader = PdfReader(input_pdf)
    writer = PdfWriter()
    for i in range(len(reader.pages)):
        if i < start_page - 1 or i > end_page - 1:
            writer.add_page(reader.pages[i])
    with open(output_pdf, "wb") as f:
        writer.write(f)

if __name__ == "__main__":
    remove_pages("p1.pdf", "p1_done.pdf", 1, 24)
    remove_pages("p1.pdf", "p2.pdf", 25, 39)