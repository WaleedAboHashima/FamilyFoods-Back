exports.FilterProduct = (products) => {
    return products.map((product) => {
        return {
            _id: product._id,
            name: product.name,
            nameAR: product.nameAR,
            flavor: product.flavor,
            flavorAR: product.flavorAR,
            img: product.img.imgURL,
            price: product.price,
            quantity: product.quantity,
            weight: product.weight,
            validDate: product.validDate,
            expDate: product.expDate,
            category: product.category,
            categoryAR: product.categoryAR,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        }
    })
}