<?php

function get_shop_mock_data( $original_products, $taxonomies ) {
	$products = [];
	$multiplier = 100; // e.g. 15 items * 100 = 1500 items
	$current_time = time();
	$new_min_price = PHP_INT_MAX;
	$new_max_price = 0;

	for ($i = 0; $i < $multiplier; $i++) {
		foreach ($original_products as $prod) {
			$new_prod = $prod;
			if ($i > 0) {
				$new_prod['id'] = $prod['id'] . '-' . $i;
				$new_prod['name'] = $prod['name'] . ' (Test ' . $i . ')';
				$new_prod['price'] = (string)((float) $prod['price'] + $i);
				$new_prod['date'] = $current_time - ($i * 3600);
			}
			$products[] = $new_prod;

			$price = (float) $new_prod['price'];
			if ($price < $new_min_price) $new_min_price = $price;
			if ($price > $new_max_price) $new_max_price = $price;
		}
	}

	if ($new_min_price === PHP_INT_MAX) $new_min_price = 0;
	// ----------------------------------------------------

	return [
		'products' => $products,
		'filters'  => $taxonomies,
		'priceMin' => $new_min_price,
		'priceMax' => $new_max_price,
	];
}
