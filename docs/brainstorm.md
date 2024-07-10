## Desired AI Behaviors

when a unit has a "followTarget" state
- a behavior component is assigned based on the FSM
- e.g. a skeleton's moveTarget is based on the cursor position
Behaviors:
- chaseTarget
  - get within min/max range of target
    - melee would have no max range
  - attack
  - if outside of range definition, changeTarget

assign follow target
- based on the behavior of the entity, update/assign the moveTarget component


FormationSystem
- a formation has a list of entities
- formation will assign the moveTarget for each entity
- formation is defined as a relation of a cluster entity with child entities

AI Systems
