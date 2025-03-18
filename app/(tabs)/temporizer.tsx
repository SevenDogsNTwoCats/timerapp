import * as React from 'react';
import { SafeAreaView, View, TouchableOpacity } from 'react-native';
import { Button } from '~/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Audio } from 'expo-av';
import AlertDialogScreen from '~/components/Alert';

const Temporizer = () => {
    const [sound, setSound] = React.useState<Audio.Sound | null>(null);
    const [isActive, setIsActive] = React.useState(false);
    const [hours, setHours] = React.useState(0);
    const [minutes, setMinutes] = React.useState(0);
    const [seconds, setSeconds] = React.useState(0);
    const [totalTimeInSeconds, setTotalTimeInSeconds] = React.useState(0);
    const [timeRemaining, setTimeRemaining] = React.useState(0);
    const [alertDialogOpen, setAlertDialogOpen] = React.useState(false);
    const [lastConfiguration, setLastConfiguration] = React.useState({ hours: 0, minutes: 0, seconds: 0 });

    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

    // Load and play alarm sound
    async function playAlarmSound() {
        try {
            // Unload any previous sound first
            if (sound) {
                await sound.unloadAsync();
            }

            console.log('Loading Sound');
            const { sound: newSound } = await Audio.Sound.createAsync(
                require('../../assets/audio/alarm-clock-short-6402.mp3')
            );
            setSound(newSound);

            console.log('Playing Sound');
            await newSound.playAsync();
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    // Function to stop the sound
    const stopSound = async () => {
        if (sound) {
            try {
                await sound.stopAsync();
                await sound.unloadAsync();
                setSound(null);
            } catch (error) {
                console.error('Error stopping sound:', error);
            }
        }
    };

    // Cleanup function for sound
    React.useEffect(() => {
        return sound
            ? () => {
                console.log('Unloading Sound');
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    // Set up timer functionality
    React.useEffect(() => {
        if (isActive && timeRemaining > 0) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        // Timer completed
                        clearInterval(intervalRef.current!);
                        setIsActive(false);
                        playAlarmSound();
                        setAlertDialogOpen(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, timeRemaining]);

    // Update time display when timeRemaining changes
    React.useEffect(() => {
        if (!isActive) {
            const total = hours * 3600 + minutes * 60 + seconds;
            setTotalTimeInSeconds(total);
            setTimeRemaining(total);
        }
    }, [hours, minutes, seconds, isActive]);

    // Make sure we update lastConfiguration whenever time values change
    React.useEffect(() => {
        if (!isActive) {
            // Update the last configuration whenever time values are changed and timer is not active
            const currentConfig = { hours, minutes, seconds };
            setLastConfiguration(currentConfig);
            console.log('Configuration auto-updated:', currentConfig); // Debug log
        }
    }, [hours, minutes, seconds, isActive]);

    // Update the toggleTimer function to prevent starting with zero time
    const toggleTimer = () => {
        // Don't allow starting when time is zero
        if (timeRemaining <= 0 && !isActive) {
            // Only attempt to reset if we have a valid last configuration
            if (lastConfiguration.hours > 0 || lastConfiguration.minutes > 0 || lastConfiguration.seconds > 0) {
                resetToLastConfiguration();
            } else {
                // Don't allow toggling if there's no time set
                return;
            }
        }
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setHours(lastConfiguration.hours);
        setMinutes(lastConfiguration.minutes);
        setSeconds(lastConfiguration.seconds);
        setTimeRemaining(lastConfiguration.hours * 3600 + lastConfiguration.minutes * 60 + lastConfiguration.seconds);
    };

    const handleStop = () => {
        stopSound();
        setAlertDialogOpen(false);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setTimeRemaining(0);
        setIsActive(false);
    };

    const handleRestart = () => {
        stopSound();
        setAlertDialogOpen(false);

        // Set the values directly here to ensure they're updated
        setHours(lastConfiguration.hours);
        setMinutes(lastConfiguration.minutes);
        setSeconds(lastConfiguration.seconds);
        setTimeRemaining(lastConfiguration.hours * 3600 + lastConfiguration.minutes * 60 + lastConfiguration.seconds);

        console.log('Restarting with:', lastConfiguration); // Debug log

        // Start the timer again after a small delay
        setTimeout(() => {
            setIsActive(true);
        }, 300);
    };

    const resetToLastConfiguration = () => {
        // Update both the timeRemaining and the displayed time values
        setHours(lastConfiguration.hours);
        setMinutes(lastConfiguration.minutes);
        setSeconds(lastConfiguration.seconds);
        setTimeRemaining(lastConfiguration.hours * 3600 + lastConfiguration.minutes * 60 + lastConfiguration.seconds);
    };

    // Update the startTimer function to ensure we don't start with zero time
    const startTimer = () => {
        // Don't start if all values are zero
        if (hours === 0 && minutes === 0 && seconds === 0) {
            return;
        }

        // Save the current configuration before starting
        const currentConfig = { hours, minutes, seconds };
        setLastConfiguration(currentConfig);
        console.log('Saving configuration before start:', currentConfig); // Debug log
        setIsActive(true);
    };

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const TimeControl = ({ value, setValue, max, label }: { value: number, setValue: (val: number) => void, max: number, label: string }) => (
        <View className="items-center">
            <Text className="text-center mb-2">{label}</Text>
            <View className="flex-row items-center space-x-2">
                <Button
                    onPress={() => setValue(value > 0 ? value - 1 : 0)}
                    disabled={isActive}
                    variant={"outline"}
                    size={"icon"}
                >
                    <FontAwesome name="minus" size={16} color={isActive ? "#999999" : "#007AFF"} />
                </Button>
            </View>
            <Text className="text-3xl font-bold my-2">{value.toString().padStart(2, '0')}</Text>
            <View className="flex-row items-center space-x-2">
                <Button
                    onPress={() => setValue(value < max ? value + 1 : max)}
                    disabled={isActive}
                    variant={"outline"}
                    size={"icon"}
                >
                    <FontAwesome name="plus" size={16} color={isActive ? "#999999" : "#007AFF"} />
                </Button>
            </View>
        </View>
    );

    return (
        <SafeAreaView className='flex-1 justify-center items-center gap-5 p-6 bg-secondary/30'>
            {/* Alert Dialog for timer completion */}
            <AlertDialogScreen
                open={alertDialogOpen}
                onOpenChange={setAlertDialogOpen}
                title="¡Temporizador finalizado!"
                description="El tiempo ha llegado a cero."
                cancelText="Detener"
                actionText="Reiniciar"
                onCancel={handleStop}
                onAction={handleRestart}
            />

            <Card className="w-full max-w-md mx-auto">
                <CardContent className="space-y-6 py-6">
                    <View className="items-center">
                        <Text className="text-5xl font-bold mb-6">
                            {isActive ? formatTime(timeRemaining) : formatTime(totalTimeInSeconds)}
                        </Text>
                        <View className="flex-row justify-center space-x-4 gap-4">

                            <Button variant="outline" size="icon" onPress={handleStop}
                                disabled={(hours === 0 && minutes === 0 && seconds === 0)}
                            >
                                <FontAwesome
                                    name="refresh"
                                    size={16}
                                    color="#007AFF"
                                />
                            </Button>
                        </View>
                    </View>

                    {!isActive && (
                        <View className="flex-row justify-between mt-8">
                            <TimeControl
                                value={hours}
                                setValue={setHours}
                                max={23}
                                label="Horas"
                            />
                            <TimeControl
                                value={minutes}
                                setValue={setMinutes}
                                max={59}
                                label="Minutos"
                            />
                            <TimeControl
                                value={seconds}
                                setValue={setSeconds}
                                max={59}
                                label="Segundos"
                            />
                        </View>
                    )}
                </CardContent>

                <CardFooter>
                    <Button
                        className="w-full flex-row items-center justify-center gap-4"
                        variant="outline"
                        onPress={isActive ? toggleTimer : startTimer}
                        disabled={(hours === 0 && minutes === 0 && seconds === 0)}
                    >
                        <FontAwesome
                            name={isActive ? "pause" : "play"}
                            size={16}
                            color="#007AFF"
                        />
                        <Text>{isActive ? "Pausar" : "Iniciar"}</Text>
                    </Button>
                </CardFooter>
            </Card>
        </SafeAreaView>
    );
};

export default Temporizer;