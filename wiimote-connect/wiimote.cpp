// #include "wiiuse.h"
#include "../build/include/wiiuse.h"
#include <cstdio>
#include <csignal>

volatile sig_atomic_t exit_flag = 0;

void handle_sigint(int signal) {
    exit_flag = 1;
}

void handle_event(wiimote* wiimote) {
    if (IS_JUST_PRESSED(wiimote, WIIMOTE_BUTTON_A)) {
        printf("A\n");
    }
    if (IS_JUST_PRESSED(wiimote, WIIMOTE_BUTTON_B)) {
        printf("B\n");
    }
    if (IS_RELEASED(wiimote, WIIMOTE_BUTTON_A)) {
        printf("A released\n");
    }
    if (IS_RELEASED(wiimote, WIIMOTE_BUTTON_B)) {
        printf("B released\n");
    }
    if (WIIUSE_USING_ACC(wiimote)) {
        printf("%d %d %d\n", wiimote->accel.x, wiimote->accel.y, wiimote->accel.z);
    }
}

int main(int argc, char const *argv[]) {
    wiimote** wiimotes = wiiuse_init(3);
    const int TIMEOUT = 3;
    int found = wiiuse_find(wiimotes, 3, TIMEOUT);
    if (!found) {
        fprintf(stderr, "Error: No wiimotes found.\n");
        return 1;
    }
    int connected = wiiuse_connect(wiimotes, 3);
    if (!connected) {
        fprintf(stderr, "Error: Failed to connect to wiimote.\n");
        return 1;
    }
    wiimote* wiimote = wiimotes[0];

    wiiuse_set_leds(wiimote, WIIMOTE_LED_1);
    wiiuse_motion_sensing(wiimote, 1); // enable motion sensing

    if (signal(SIGINT, handle_sigint) == SIG_ERR) {
        fprintf(stderr, "Warning: unable to handle signal\n");
    }

    while (WIIMOTE_IS_CONNECTED(wiimote) && !exit_flag) {
        if (wiiuse_poll(wiimotes, 3)) {
            switch (wiimote->event) {
                case WIIUSE_EVENT:
                    handle_event(wiimote);
                    break;
                default:
                    break;
            }
        }
    }
    wiiuse_cleanup(wiimotes, 3);
    return 0;
}
