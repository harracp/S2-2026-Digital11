import requests
from datetime import date


barcode = input("Barcode: ")
url = f"https://world.openfoodfacts.net/api/v2/product/{barcode}"
response = requests.get(url)
#print(response.json())

data = response.json()

product_name = data.get("product", {}).get("product_name", "Product name not found")
ingredients = data.get("product", {}).get("ingredients_text", "Product ingredients not found")
print(f"Product Name: {product_name}")
