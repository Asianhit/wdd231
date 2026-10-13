/* Load and validate the product catalog from the local JSON data source. */
export async function fetchProducts() {
    try {
        const response = await fetch('./data/product.json');
        if (!response.ok) {
            throw new Error(`Product request failed with status ${response.status}`);
        }

        const products = await response.json();
        if (!Array.isArray(products)) {
            throw new TypeError('The product catalog must be a JSON array.');
        }

        return products;
    } catch (error) {
        console.error('Unable to load the ApexMart product catalog:', error);
        return [];
    }
}