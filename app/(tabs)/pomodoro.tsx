import * as React from 'react';
import { SafeAreaView, View, Alert } from 'react-native';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import Slider from '@react-native-community/slider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Audio } from 'expo-av';
import AlertDialogScreen from '~/components/Alert';

export default function Screen() {
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);
  const [mode, setMode] = React.useState<"focus" | "break">("focus");
  const [isActive, setIsActive] = React.useState(false);
  const [time, setTime] = React.useState(25 * 60); // 25 minutes in seconds
  const [focusTime, setFocusTime] = React.useState(25); // in minutes
  const [breakTime, setBreakTime] = React.useState(5); // in minutes

  // New state for the alert dialog
  const [alertDialogOpen, setAlertDialogOpen] = React.useState(false);
  const [completedTimerType, setCompletedTimerType] = React.useState<"focus" | "break">("focus");

  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Load and play alarm sound
  async function playAlarmSound(timerType?: "focus" | "break") {
    try {
      // Unload any previous sound first
      if (sound) {
        await sound.unloadAsync();
      }

      console.log(`Timer completed: ${timerType || "unknown"}`);
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

  React.useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            // Determinar qué tipo de temporizador terminó
            const timerCompleted = mode === "focus" ? "focus" : "break";

            // Save the completed timer type
            setCompletedTimerType(timerCompleted);

            // Play alarm sound when timer ends
            playAlarmSound(timerCompleted);

            // Show alert dialog
            setAlertDialogOpen(true);

            // Stop the timer
            setIsActive(false);
            clearInterval(intervalRef.current!);

            // Return the current time (will be changed when user responds to dialog)
            return prevTime;
          }
          return prevTime - 1;
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
  }, [isActive, mode, focusTime, breakTime]);

  // Handle continuing to the next mode
  const handleContinue = () => {
    stopSound();
    const newMode = completedTimerType === "focus" ? "break" : "focus";
    setMode(newMode);
    setTime(newMode === "focus" ? focusTime * 60 : breakTime * 60);
    setAlertDialogOpen(false);

    // Automatically start the timer when continuing to the next mode
    setTimeout(() => {
      setIsActive(true);
    }, 300); // Small delay to ensure mode change has been processed
  };

  // Handle stopping the timer
  const handleStop = () => {
    stopSound();
    setAlertDialogOpen(false);
    // Keep current mode, just silence the alarm
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(mode === "focus" ? focusTime * 60 : breakTime * 60);
  };

  const switchMode = (newMode: "focus" | "break") => {
    setMode(newMode);
    setIsActive(false);
    setTime(newMode === "focus" ? focusTime * 60 : breakTime * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Alert dialog title and description based on completed timer type
  const getAlertDialogProps = () => {
    if (completedTimerType === "focus") {
      return {
        title: "¡Tiempo de concentración completado!",
        description: "Has completado tu sesión de concentración. ¿Quieres tomar un descanso?",
        actionText: "Iniciar descanso",
        cancelText: "Detener",
      };
    } else {
      return {
        title: "¡Tiempo de descanso completado!",
        description: "Has completado tu descanso. ¿Quieres volver a concentrarte?",
        actionText: "Iniciar concentración",
        cancelText: "Detener",
      };
    }
  };

  return (
    <SafeAreaView className='flex-1 justify-center items-center gap-5 p-6 bg-secondary/30'>
      {/* Alert Dialog for timer completion */}
      <AlertDialogScreen
        open={alertDialogOpen}
        onOpenChange={setAlertDialogOpen}
        title={getAlertDialogProps().title}
        description={getAlertDialogProps().description}
        cancelText={getAlertDialogProps().cancelText}
        actionText={getAlertDialogProps().actionText}
        onCancel={handleStop}
        onAction={handleContinue}
      />

      <Card className="w-full max-w-md mx-auto">
        <CardContent className="space-y-6">
          <Tabs
            value={mode} onValueChange={(v) => switchMode(v as "focus" | "break")}
            className='w-full max-w-[400px] mx-auto flex-col gap-1.5'
          >
            <TabsList className='flex-row w-full my-8'>
              <TabsTrigger value='focus' className='flex-1'>
                <Text>Concentración</Text>
              </TabsTrigger>
              <TabsTrigger value='break' className='flex-1'>
                <Text>Descanso</Text>
              </TabsTrigger>
            </TabsList>
            <TabsContent value={mode} className='w-full'>
              <View className="items-center">
                <Text className="text-6xl font-bold mb-6">{formatTime(time)}</Text>
                <View className="flex-row justify-center space-x-4 gap-4">
                  <Button size="icon" variant="outline" onPress={toggleTimer}>
                    {/* Corregido: FontAwesome debe estar directamente dentro del Button */}
                    <FontAwesome
                      name={isActive ? "pause" : "play"}
                      size={16}
                      color="#007AFF"
                    />
                  </Button>
                  <Button variant="outline" size="icon" onPress={resetTimer}>
                    {/* Corregido: FontAwesome debe estar directamente dentro del Button */}
                    <FontAwesome
                      name="refresh"
                      size={16}
                      color="#007AFF"
                    />
                  </Button>
                </View>
              </View>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex-col gap-4">
          <View className="w-full space-y-2">
            <View className="flex-row justify-between items-center">
              <Text>Tiempo de concentración</Text>
              <View className="flex-row items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    const newValue = Math.max(5, focusTime - 5);
                    setFocusTime(newValue);
                    if (mode === "focus" && !isActive) {
                      setTime(newValue * 60);
                    }
                  }}
                  disabled={isActive && mode === "focus"}
                >
                  <FontAwesome name="minus" size={16} color="#007AFF" />
                </Button>
                <Text className="w-8 text-center">{focusTime}</Text>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    const newValue = Math.min(60, focusTime + 5);
                    setFocusTime(newValue);
                    if (mode === "focus" && !isActive) {
                      setTime(newValue * 60);
                    }
                  }}
                  disabled={isActive && mode === "focus"}
                >
                  <FontAwesome name="plus" size={16} color="#007AFF" />
                </Button>
              </View>
            </View>
            <Slider
              value={focusTime}
              minimumValue={5}
              maximumValue={60}
              step={5}
              onSlidingComplete={(value) => {
                setFocusTime(value);
                if (mode === "focus" && !isActive) {
                  setTime(value * 60);
                }
              }}
              disabled={isActive && mode === "focus"}
              style={{ width: '100%', height: 40 }}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#000000"
            />
          </View>
          <View className="w-full space-y-2">
            <View className="flex-row justify-between items-center">
              <Text>Tiempo de descanso</Text>
              <View className="flex-row items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    const newValue = Math.max(1, breakTime - 1);
                    setBreakTime(newValue);
                    if (mode === "break" && !isActive) {
                      setTime(newValue * 60);
                    }
                  }}
                  disabled={isActive && mode === "break"}
                >
                  <FontAwesome name="minus" size={16} color="#007AFF" />
                </Button>
                <Text className="w-8 text-center">{breakTime}</Text>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    const newValue = Math.min(30, breakTime + 1);
                    setBreakTime(newValue);
                    if (mode === "break" && !isActive) {
                      setTime(newValue * 60);
                    }
                  }}
                  disabled={isActive && mode === "break"}
                >
                  <FontAwesome name="plus" size={16} color="#007AFF" />
                </Button>
              </View>
            </View>
            <Slider
              value={breakTime}
              minimumValue={1}
              maximumValue={30}
              step={1}
              onSlidingComplete={(value) => {
                // Este método se llama solo cuando terminas de deslizar, evitando actualizaciones frecuentes
                setBreakTime(value);
                if (mode === "break" && !isActive) {
                  setTime(value * 60);
                }
              }}
              // Solo actualizamos el valor sin afectar el tiempo hasta que se complete el deslizamiento
              onValueChange={(value) => {
                // No hacemos nada aquí o solo actualizamos un estado temporal
              }}
              disabled={isActive && mode === "break"}
              style={{ width: '100%', height: 40 }}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#000000"
            />
          </View>
        </CardFooter>
      </Card>
    </SafeAreaView>
  );
}