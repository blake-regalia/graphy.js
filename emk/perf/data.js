let a_dbpedia_files_tql = [
	// 'anchor_text_en',  // 15 GB
	'article_categories_en',
	'article_templates_en',
	'category_labels_en',
// 'citation_data_en',
	'citation_links_en',
	'commons_page_links_en',
	'disambiguations_en',
	'equations_en',
	'external_links_en',
	'genders_en',
	'geo_coordinates_en',
	'geo_coordinates_mappingbased_en',
	'homepages_en',
	'images_en',
	'infobox_properties_en',
	'infobox_properties_mapped_en',
	'infobox_property_definitions_en',
	'infobox_test_en',
	'instance_types_en',
	'instance_types_sdtyped_dbo_en',
	'instance_types_transitive_en',
	'interlanguage_links_en',
	'interlanguage_links_chapters_en',
	'labels_en',
	'long_abstracts_en',
	'mappingbased_literals_en',
	'mappingbased_objects_en',
	'mappingbased_objects_disjoint_domain_en',
	'mappingbased_objects_disjoint_range_en',
	'mappingbased_objects_uncleaned_en',
	'article_templates_nested_en',
	// 'nif_context_en',
	// 'nif_page_structure_en',  // 43 GB
	// 'nif_text_links_en',  // 29 GB
	'out_degree_en',
	'page_ids_en',
	'page_length_en',
	// 'page_links_en',  // 17 GB
	'persondata_en',
	'pnd_en',
	// 'raw_tables_en',  // 14 GB
	'redirects_en',
	'revision_ids_en',
	'revision_uris_en',
	'short_abstracts_en',
	'skos_categories_en',
	'specific_mappingbased_properties_en',
	'topical_concepts_en',
	'uri_same_as_iri_en',
	'wikipedia_links_en',
];

let a_dbpedia_files_ttl = [
	...a_dbpedia_files_tql,
	'freebase_links_en',
	'geonames_links_en',
	'transitive_redirects_en',
	'template_parameters_en',
];

let a_dbr_files = [
	'Banana',
	'Grapefruit',
	'Watermelon',
];

module.exports = {
	'text/turtle': {
		dbpedia: a_dbpedia_files_ttl.reduce((h_out, s_label) => ({
			...h_out,
			[s_label]: () => `http://downloads.dbpedia.org/2016-10/core-i18n/en/${s_label}.ttl.bz2`,
		}), {}),

		'gnis-ld': {
			'feature-aliases.ttl': () => 'http://usgs-stko.geog.ucsb.edu/resource/usgs-ld.ttl',
			'features.ttl': () => 'http://usgs-stko.geog.ucsb.edu/resource/usgs-ld.ttl',
			'names.ttl': () => 'http://usgs-stko.geog.ucsb.edu/resource/usgs-ld.ttl',
			'units.ttl': () => 'http://usgs-stko.geog.ucsb.edu/resource/usgs-ld.ttl',
		},

		dbr: a_dbr_files.reduce((h_out, s_label) => ({
			...h_out,
			// [s_label+'.nt']: () => `http://dbpedia.org/data/${s_label}.nt`,
			[s_label+'.ttl']: () => `http://dbpedia.org/data/${s_label}.ttl`,
		}), {}),
	},
};
