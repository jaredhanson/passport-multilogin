MOCHA = ./node_modules/.bin/mocha

include node_modules/make-node/main.mk

MOCHAFLAGS = --require ./test/bootstrap/node


# Perform self-tests.
check: test

testfix:
	$(MOCHA) $(MOCHAFLAGS) $^