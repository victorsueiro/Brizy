<?php
/**
 * Created by PhpStorm.
 * User: alex
 * Date: 7/4/18
 * Time: 10:46 AM
 */

class Brizy_Admin_RuleSet implements Brizy_Admin_RuleInterface {

	/**
	 * @var Brizy_Admin_Rule[]
	 */
	private $rules;


	/**
	 * Brizy_Admin_RuleSet constructor.
	 *
	 * @param $rules
	 */
	public function __construct( $rules ) {

		if ( ! is_array( $rules ) ) {
			throw new InvalidArgumentException( 'Invalid RuleSet constructor argument' );
		}

		$this->rules = $rules;
	}

	/**
	 * @param $applyFor
	 * @param null $entityType
	 * @param $entityValues
	 *
	 * @return bool
	 */
	public function isGranted( $applyFor, $entityType, $entityValues ) {

		if ( count( $this->rules ) == 0 ) {
			return false;
		}

		foreach ( $this->rules as $rule ) {

			if ( $rule->isGranted( $applyFor, $entityType, $entityValues ) ) {
				return true;
			}

		}

		return false;
	}

	/**
	 * @return Brizy_Admin_Rule[]
	 */
	public function getRules() {
		return $this->rules;
	}

	/**
	 * @param Brizy_Admin_Rule[] $rules
	 *
	 * @return Brizy_Admin_RuleSet
	 */
	public function setRules( $rules ) {
		$this->rules = $rules;

		return $this;
	}

	/**
	 * @param Brizy_Admin_Rule[] $rules
	 *
	 * @return $this
	 */
	public function addRules( $rules ) {

		foreach ( (array) $rules as $rule ) {
			if ( $rule instanceof Brizy_Admin_Rule ) {
				$this->rules[] = $rule;
			}
		}

		return $this;
	}

}