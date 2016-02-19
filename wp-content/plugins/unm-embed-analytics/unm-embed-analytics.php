<?php
/*
Plugin Name: Ultimate New Media - Embed Analytics
Description: Adds Embed Analytics dashboard to admin
Version: 1.0.0
Author: Gregory Hoole <greg@ultimatenewmedia.com>
*/

require_once('embed-analytics.php');

global $unmEmbedAnalytics;

class UNM_EmbedAnalytics {

    function __construct() {
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
    }

    public static function createInstance(){
        global $unmEmbedAnalytics;
        $unmEmbedAnalytics = new UNM_EmbedAnalytics();
    }

    function admin_menu() {
        add_menu_page('Embed Analytics', 'Embed Analytics', 'administrator', 'embed_analytics', array($this, 'embed_analytics'));
    }

    function admin_enqueue_scripts(){
        
        // css includes
        wp_enqueue_style('jquery-ui', '/wp-content/lib/js/jquery-ui-1.11.4/jquery-ui.min.css');
        wp_enqueue_style('jquery-daterangepicker', '/wp-content/lib/js/jquery-daterangepicker/jquery.comiseo.daterangepicker.css');

        wp_enqueue_style('embed-analytics-style', plugins_url('css/embed-analytics.css', __FILE__));

        // javscript includes
        wp_enqueue_script('moment', '/wp-content/lib/js/moment.min.js');

        wp_enqueue_script('jquery', '/wp-content/lib/js/jquery-2.2.0.min.js');
        wp_enqueue_script('jquery-ui', '/wp-content/lib/js/jquery-ui-1.11.4/jquery-ui.min.js');
        wp_enqueue_script('jquery-daterangepicker', '/wp-content/lib/js/jquery-daterangepicker/jquery.comiseo.daterangepicker.min.js');

        wp_enqueue_script('embed-analytics-js', plugins_url( '/js/embed-analytics.js', __FILE__));
    }

    function view($file, $view_params = array()) {
        extract($view_params, EXTR_OVERWRITE);
        include_once(dirname(__FILE__) . '/views/' . $file);
    }

    function embed_analytics() {
        $date_range = array();
        if (!empty($_REQUEST['date_range'])){
            $date_range = json_decode(stripslashes($_REQUEST['date_range']), true);
        } else {
            $date_range = array(
                'start' => date('Y-m-d', strtotime('1 month ago', current_time('timestamp'))),
                'end' => current_time('Y-m-d'),
            );
        }
        $this->view('embed-analytics.phtml', array('date_range' => $date_range));
    }
}

add_action('plugins_loaded', array('UNM_EmbedAnalytics', 'createInstance') );