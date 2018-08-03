<?php
/**
 * Created by PhpStorm.
 * User: alex
 * Date: 7/4/18
 * Time: 10:46 AM
 */

class Brizy_Admin_Rule extends Brizy_Admin_Serializable implements Brizy_Admin_RuleInterface {

	const TYPE_INCLUDE = 1;
	const TYPE_EXCLUDE = 2;

	const POSTS = 1;
	const TAXONOMY = 2;
	const ARCHIVE = 4;
	const TEMPLATE = 8;

	/**
	 * @var int
	 */
	private $id;

	/**
	 * @var int
	 */
	private $type;

	/**
	 * @var int
	 */
	private $appliedFor;

	/**
	 * @var string
	 */
	private $entityType;

	/**
	 * If null the rule will be applied on all entities
	 *
	 * @var int[]
	 */
	private $entityValues = array();

	/**
	 * @return array|mixed
	 */
	public function jsonSerialize() {
		return $this->convertToOptionValue();
	}

	/**
	 * Brizy_Admin_Rule constructor.
	 *
	 * @param int $id
	 * @param int $type
	 * @param int $applied_for
	 * @param int $entity_type
	 * @param array $entities
	 */
	public function __construct( $id, $type, $applied_for, $entity_type, $entities ) {
		$this->setId( $id );
		$this->setType( $type );
		$this->setAppliedFor( $applied_for );
		$this->setEntityType( $entity_type );
		$this->setEntityValues( array_filter( (array) $entities, array( $this, 'filter' ) ) );
		$this->setId( $this->generateId( $type, $applied_for, $entity_type, $this->getEntitiesAsString() ) );
	}

	function filter( $v ) {
		return ! empty( $v );
	}

	/**
	 * Return true if the rule matches for the given parameters
	 *
	 * @param $applied_for
	 * @param null $entity
	 *
	 * @return bool
	 */
	public function isGranted( $applyFor, $entityType, $entityValues ) {

		$ruleValues = array_filter( array(
			$this->getType(),
			$this->getAppliedFor(),
			$this->getEntityType(),
			$this->getEntityValues(),
		),function($v) { return !empty($v); } );

		$checkValues = array(
			self::TYPE_INCLUDE,
			$applyFor,
			$entityType,
			$entityValues,
		);

		foreach ( $ruleValues as $i => $value ) {

			if (  is_array( $value ) ) {
				// this means that the rull accept any value
				if(count($ruleValues[ $i ])==0)
					return true;

				// check if the value is contained in this rule
				if ( count( array_diff( $checkValues[ $i ], $ruleValues[ $i ] ) ) != 0 ) {
					return false;
				}

			} else {
				if ( $ruleValues[ $i ] != $checkValues[ $i ] ) {
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * @return int
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * @param int $id
	 *
	 * @return Brizy_Admin_Rule
	 */
	public function setId( $id ) {

		$this->id = $id;

		return $this;
	}

	/**
	 * @return int
	 */
	public function getType() {
		return $this->type;
	}

	/**
	 * @param int $type
	 *
	 * @return Brizy_Admin_Rule
	 */
	public function setType( $type ) {
		$this->type = $type;

		return $this;
	}

	/**
	 * @return int
	 */
	public function getAppliedFor() {
		return $this->appliedFor;
	}

	/**
	 * @param int $appliedFor
	 *
	 * @return Brizy_Admin_Rule
	 */
	public function setAppliedFor( $appliedFor ) {
		$this->appliedFor = $appliedFor;

		return $this;
	}

	/**
	 * @return string
	 */
	public function getEntityType() {
		return $this->entityType;
	}

	/**
	 * @param string $entityType
	 *
	 * @return Brizy_Admin_Rule
	 */
	public function setEntityType( $entityType ) {
		$this->entityType = $entityType;

		return $this;
	}

	/**
	 * @return string[]
	 */
	public function getEntityValues() {
		return is_null( $this->entityValues ) ? array() : $this->entityValues;
	}

	/**
	 * @param int[] $entityValues
	 *
	 * @return Brizy_Admin_Rule
	 */
	public function setEntityValues( $entityValues ) {

		if ( ! is_array( $entityValues ) ) {
			throw new InvalidArgumentException();
		}

		$this->entityValues = $entityValues;

		return $this;
	}

	/**
	 * @return array
	 */
	public function convertToOptionValue() {
		return array(
			'id'           => $this->getId(),
			'type'         => $this->getType(),
			'appliedFor'   => $this->getAppliedFor(),
			'entityType'   => $this->getEntityType(),
			'entityValues' => $this->getEntityValues(),
		);
	}

	/**
	 * @param $data
	 *
	 * @return Brizy_Admin_Rule|void
	 */
	static public function createFromSerializedData( $data ) {
		return new self(
			isset( $data['id'] ) ? $data['id'] : null,
			isset( $data['type'] ) ? $data['type'] : null,
			isset( $data['appliedFor'] ) ? $data['appliedFor'] : null,
			isset( $data['entityType'] ) ? $data['entityType'] : null,
			isset( $data['entityValues'] ) ? $data['entityValues'] : null
		);
	}

	/**
	 * @param $data
	 *
	 * @return Brizy_Admin_Rule|void
	 */
	static public function createFromRequestData( $data ) {
		return new self(
			isset( $data['id'] ) ? $data['id'] : null,
			isset( $data['type'] ) ? $data['type'] : null,
			isset( $data['appliedFor'] ) ? $data['appliedFor'] : null,
			isset( $data['entityType'] ) ? $data['entityType'] : null,
			isset( $data['entityValues'] ) ? $data['entityValues'] : null
		);
	}

	/**
	 * @param Brizy_Admin_Rule $rule
	 *
	 * @return bool
	 */
	public function isOverriddenBy( $rule ) {

		return $this->getType() == $rule->getType() &&
		       $this->getAppliedFor() == $rule->getAppliedFor() &&
		       $this->getEntityType() == $rule->getEntityType() &&
		       ( count( $rule->getEntityValues() ) || count( array_diff( $rule->getEntityValues(), $this->getEntityValues() ) ) == 0 );
	}

	/**
	 * @param string $delimited
	 *
	 * @return string
	 */
	public function getEntitiesAsString( $delimited = ',' ) {
		return implode( $delimited, $this->getEntityValues() );
	}

	/**
	 * @return string
	 */
	private function generateId() {
		return md5( implode( '', func_get_args() ) );
	}

}