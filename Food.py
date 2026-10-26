import requests

headers = {"User-Agent": "MyBarcodeApp/1.0 (ADD YOUR EMAIL)"}

barcode = input("Enter a barcode: ")
url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}"

response = requests.get(url, headers=headers)
data = response.json()

product = data.get("product", {})
print(f"Name: {product.get('product_name', 'Not found')}")
print(f"Brand: {product.get('brands', 'Not found')}")
print(f"Nutri-Score: {product.get('nutriscore_grade', 'Not listed')}")
print(f"Energy: {product.get('nutriments', {}).get('energy-kcal_100g', 'Not listed')} kcal/100g")