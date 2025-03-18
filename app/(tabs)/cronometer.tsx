import * as React from 'react';
import { SafeAreaView, View, ScrollView } from 'react-native';
import { Button } from '~/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function Cronometer() {
    const [isActive, setIsActive] = React.useState(false);
    const [time, setTime] = React.useState(0); // in milliseconds
    const [laps, setLaps] = React.useState<{ time: number; message: string }[]>([]);
    const [lapMessage, setLapMessage] = React.useState("");

    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (isActive) {
            startTimeRef.current = Date.now() - time;
            intervalRef.current = setInterval(() => {
                setTime(Date.now() - startTimeRef.current!);
            }, 10);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTime(0);
        setLaps([]);
    };

    const addLap = () => {
        if (time > 0) {
            // Use unshift pattern instead of spread to add new laps to the beginning
            setLaps([{ time, message: lapMessage || `Vuelta ${laps.length + 1}` }, ...laps]);
            setLapMessage(""); // Clear message after adding it
        }
    };

    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10);

        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
    };

    return (
        <SafeAreaView className='flex-1 justify-center items-center gap-5 p-6 bg-secondary/30'>
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                </CardHeader>

                <CardContent className="space-y-6">
                    <View className="items-center">
                        <Text className="text-6xl font-bold mb-6">{formatTime(time)}</Text>
                        <View className="flex-row justify-center space-x-4 gap-4">
                            <Button size="icon" variant="outline" onPress={toggleTimer}>
                                <FontAwesome
                                    name={isActive ? "pause" : "play"}
                                    size={16}
                                    color="#007AFF"
                                />
                            </Button>
                            <Button variant="outline" size="icon" onPress={resetTimer}>
                                <FontAwesome
                                    name="refresh"
                                    size={16}
                                    color="#007AFF"
                                />
                            </Button>
                        </View>
                    </View>

                    <View className="mt-4 space-y-2">
                        <View className="flex-row gap-2 mt-2">
                            <View className="flex-1">
                                <Input
                                    id="lap-message"
                                    value={lapMessage}
                                    onChangeText={setLapMessage}
                                    placeholder="Vuelta"
                                // Remove editable={isActive} to allow editing anytime
                                />
                            </View>
                            <Button
                                variant="outline"
                                onPress={addLap}
                                disabled={time <= 0}
                            >
                                <View className="flex-row items-center">
                                    <FontAwesome
                                        name="flag"
                                        size={16}
                                        color={time > 0 ? "#007AFF" : "#999999"}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text
                                        className={time > 0 ? "text-blue-500" : "text-gray-500"}
                                    >Marcar</Text>
                                </View>
                            </Button>
                        </View>
                    </View>
                </CardContent>

                <CardFooter>
                    {laps.length > 0 && (
                        <View className="h-[200px] w-full border rounded-md overflow-hidden">
                            <ScrollView className="p-4 border border-blue-500">
                                {laps.map((lap, index) => (
                                    <View key={index} className="flex-row justify-between py-1">
                                        <Text>{lap.message}</Text>
                                        <Text>{formatTime(lap.time)}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </CardFooter>
            </Card>
        </SafeAreaView >
    );
}