import requests
from bs4 import BeautifulSoup

# List of URLs to scrape
urls = [
    'https://ia902904.us.archive.org/6/items/NineteenEightyFour-Novel-GeorgeOrwell/orwell1984.pdf'
]

# Function to scrape text from a URL
def scrape_text(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    paragraphs = soup.find_all('p')
    text = ' '.join([para.get_text() for para in paragraphs])
    return text

# Compile text from all URLs
compiled_text = ''
for url in urls:
    compiled_text += scrape_text(url) + ' '

# Save the compiled text to a file
with open('compiled_text.txt', 'w', encoding='utf-8') as file:
    file.write(compiled_text)

print('Text compiled and saved to compiled_text.txt')