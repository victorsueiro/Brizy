<?php
/**
 * Created by PhpStorm.
 * User: alex
 * Date: 7/4/18
 * Time: 2:41 PM
 */

class Brizy_TwigEngine {

	/**
	 * @var Twig_LoaderInterface
	 */
	private $loader;

	/**
	 * @var Twig_Environment
	 */
	private $environment;

	/**
	 * @param $path
	 *
	 * @return Brizy_TwigEngine
	 */
	static public function instance( $path ) {

		$templates        = glob( rtrim( $path, "/" ) . "/*.html.twig" );
		$loader_templates = array();
		foreach ( $templates as $template ) {

			if ( in_array( $template, array( ".", ".." ) ) ) {
				continue;
			}

			$loader_templates[ basename( $template ) ] = file_get_contents( $template );
		}

		return new self( new Twig_Loader_Array( $loader_templates ) );
	}

	/**
	 * TwigEngine constructor.
	 *
	 * @param $loader
	 */
	public function __construct( $loader ) {
		$this->loader      = $loader;
		$this->environment = new Twig_Environment( $loader, array( 'debug' => WP_DEBUG ) );

		if ( WP_DEBUG ) {

			function dump( $value ) {
				var_dump( $value );
			}
			$this->environment->addFunction( new Twig_SimpleFunction( 'dump', 'dump' ) );
		}
	}

	/**
	 * @param $template_name
	 * @param array $context
	 *
	 * @return string
	 * @throws Twig_Error_Loader
	 * @throws Twig_Error_Runtime
	 * @throws Twig_Error_Syntax
	 */
	public function render( $template_name, $context = array() ) {
		return $this->environment->load( $template_name )->render( $context );
	}
}