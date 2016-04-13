#include "wiiuse.h"
#include <cstdio>
int main(int argc, char const *argv[]) {
    wiimote** wiimotes = wiiuse_init(3);
    const int TIMEOUT = 8;
    int found = wiiuse_find(wiimotes, 3, TIMEOUT);
    if (!found) {
        fprintf(stderr, "Error: No wiimotes found.\n");
        return 1;
    }
    int connected = wiiuse_connect(wiimotes, 3);
    if (!connected) {
        fprintf(stderr, "Error: Failed to connect to wiimote.\n");
    }
    wiiuse_cleanup(wiimotes, 3);
    return 0;
}
