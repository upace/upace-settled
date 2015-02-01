<?php

$SITE = array(
    "name" => "UPACE",
    "base_url" => "http://upace.com",
    "fb_app_id" => "371970302963349",
    "libraries_path" => __DIR__ . '/lib',
    "templates_path" => __DIR__ . '/templates',
    "templates_cache_path" => __DIR__ . '/cache',
    "includes_path" => __DIR__ . '/includes',
    "helpers_path" => __DIR__ . '/helpers',
    "css_path" => "http://" . $_SERVER['HTTP_HOST'] . "/static/css",
    "css_local_path" => __DIR__ . '/www/static/css',
    "images_path" => "http://" . $_SERVER['HTTP_HOST'] . "/static/images",
    "images_local_path" => __DIR__ . '/www/static/images',
    "js_path" => "http://" . $_SERVER['HTTP_HOST'] . "/static/js",
    "js_local_path" => __DIR__ . '/www/static/js',
    "fonts_path" => "http://" . $_SERVER['HTTP_HOST'] . "/static/fonts",
    "fonts_local_path" => __DIR__ . "/www/static/fonts"
);

ini_set("error_reporting", "true");
error_reporting(E_ALL|E_STRICT);

require_once $SITE['helpers_path'] . '/TemplateRenderer.php';