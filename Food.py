import requests

headers = {"User-Agent": "MyBarcodeApp/1.0 (ADD YOUR EMAIL)"}

DEFAULT_BARCODE = "3033710065967"  # Weetabix
COMPARE_BARCODES = ["3017620422003", "5449000000996", "7622210449283"]  # Nutella, Coke, Oreo


def get_product(barcode):
    url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}"
    try:
        response = requests.get(url, headers=headers, timeout=10)
        data = response.json()
    except (requests.exceptions.RequestException, ValueError):
        print("Could not reach OpenFoodFacts. Check your internet and try again.")
        return None

    if data.get("status") != 1:
        print("Product not found. Check the barcode and try again.")
        return None

    return data.get("product", {})


def get_recommendation(grade, sugars):
    if grade is not None:
        grade = grade.upper()
        if grade == "A":
            return "Nutri-Score A: Healthy choice!"
        elif grade == "B":
            return "Nutri-Score B: Good choice."
        elif grade == "C":
            return "Nutri-Score C: Okay in moderation."
        elif grade == "D":
            return "Nutri-Score D: Limit your intake."
        elif grade == "E":
            return "Nutri-Score E: Consume in moderation."

    if sugars is not None:
        if sugars <= 5:
            return f"Low sugar ({sugars} g/100g): Healthy choice!"
        elif sugars <= 22.5:
            return f"Moderate sugar ({sugars} g/100g): Okay in moderation."
        else:
            return f"High sugar ({sugars} g/100g): Consume in moderation."

    return "No Nutri-Score or sugar data available."


def check_carbs(carbs):
    if carbs is None:
        return "No carbohydrate data available."
    if carbs < 100:
        return f"Carbohydrates: {carbs} g/100g (below 100g)"
    else:
        return f"Carbohydrates: {carbs} g/100g (100g or above)"


def show_product(product):
    nutriments = product.get("nutriments", {})
    name = product.get("product_name", "Product name not found")
    brand = product.get("brands", "Brand not found")
    ingredients = product.get("ingredients_text_en") or product.get("ingredients_text", "Ingredients not found")
    energy = nutriments.get("energy-kcal_100g", "Not listed")

    print(f"\nProduct Name: {name}")
    print(f"Brand: {brand}")
    print(f"Energy: {energy} kcal/100g")
    print(f"Ingredients: {ingredients}")
    print(get_recommendation(product.get("nutriscore_grade"), nutriments.get("sugars_100g")))
    print(check_carbs(nutriments.get("carbohydrates_100g")))


def compare_items():
    for barcode in COMPARE_BARCODES:
        product = get_product(barcode)
        if product is None:
            continue
        nutriments = product.get("nutriments", {})

        print(f"\n--- {product.get('product_name', 'Unknown product')} ---")
        print(f"Brand: {product.get('brands', 'Not listed')}")
        print(f"Nutri-Score: {product.get('nutriscore_grade', 'Not listed')}")
        print(f"Energy: {nutriments.get('energy-kcal_100g', 'Not listed')} kcal/100g")
        print(f"Sugar: {nutriments.get('sugars_100g', 'Not listed')} g/100g")
        print(f"Fat: {nutriments.get('fat_100g', 'Not listed')} g/100g")


def print_menu():
    print("\n=== OpenFoodFacts Barcode Catalogue ===")
    print("1. View sample product")
    print("2. Enter your own barcode")
    print("3. Compare 3 items")
    print("4. Exit")


def main():
    while True:
        print_menu()
        choice = input("Enter your choice: ").strip()

        if choice == "1":
            product = get_product(DEFAULT_BARCODE)
            if product is not None:
                show_product(product)
        elif choice == "2":
            barcode = input("Enter a barcode (numbers only): ").strip()
            if not barcode.isdigit():
                print("Barcodes must contain numbers only.")
            else:
                product = get_product(barcode)
                if product is not None:
                    show_product(product)
        elif choice == "3":
            compare_items()
        elif choice == "4":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()