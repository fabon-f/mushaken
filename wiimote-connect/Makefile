wiimote-connect: wiimote.cpp
	g++ -Wall -O2 -std=c++11 -o wiimote-connect -I $(CURDIR)/../build/include -L $(CURDIR)/../build/lib -lwiiuse wiimote.cpp
	./after-build

.PHONY: clean
clean:
	$(RM) wiimote-connect

.PHONY: install
install:
	cp wiimote-connect $(CURDIR)/../build/bin/

all: wiimote-connect
