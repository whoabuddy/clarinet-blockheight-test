
;; title: blockheight-store
;; version:
;; summary:
;; description:

;; traits
;;

;; token definitions
;;

;; constants
;;
(define-constant SELF (as-contract tx-sender))

;; data vars
;;
(define-data-var currentStacksBlock uint stacks-block-height)
(define-data-var currentBitcoinBlock uint burn-block-height)

;; data maps
;;
(define-map StacksFromBitcoin
  uint ;; bitcoin block height
  uint ;; stacks block height
)

(define-map BitcoinFromStacks
  uint ;; stacks block height
  uint ;; bitcoin block height
)

;; public functions
;;
(define-public (create-block-record)
  (begin 
    (var-set currentStacksBlock stacks-block-height)
    (var-set currentBitcoinBlock burn-block-height)
    (map-set StacksFromBitcoin burn-block-height stacks-block-height)
    (map-set BitcoinFromStacks stacks-block-height burn-block-height)
    (print {
      notification: "create-block-record",
      payload: {
        stacksBlock: stacks-block-height,
        bitcoinBlock: burn-block-height
      }
    })
    (ok true)
  )
)

;; read only functions
;;
(define-read-only (get-current-block-record)
  {
    stacksBlock: (var-get currentStacksBlock),
    bitcoinBlock: (var-get currentBitcoinBlock),
    stacksFromBitcoin: (map-get? StacksFromBitcoin (var-get currentBitcoinBlock)),
    bitcoinFromStacks: (map-get? BitcoinFromStacks (var-get currentStacksBlock))
  }
)

(define-read-only (get-block-record (stacksBlock uint) (bitcoinBlock uint))
  {
    stacksBlock: stacksBlock,
    bitcoinBlock: bitcoinBlock,
    stacksFromBitcoin: (map-get? StacksFromBitcoin bitcoinBlock),
    bitcoinFromStacks: (map-get? BitcoinFromStacks stacksBlock)
  }
)

;; private functions
;;

