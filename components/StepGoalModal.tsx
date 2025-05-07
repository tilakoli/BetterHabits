import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { getRandomMotivationalQuote } from '@/utils/habitUtils';

interface StepGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (steps: number) => void;
  initialValue: number;
}

const StepGoalModal: React.FC<StepGoalModalProps> = ({
  visible,
  onClose,
  onSave,
  initialValue
}) => {
  const [stepGoal, setStepGoal] = useState(initialValue.toString());
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const quote = getRandomMotivationalQuote();

  const handleSave = () => {
    const steps = parseInt(stepGoal, 10);
    if (isNaN(steps) || steps <= 0) {
      setStepGoal(initialValue.toString());
      return;
    }
    
    // Cap at 10,000 steps
    const cappedSteps = Math.min(steps, 10000);
    onSave(cappedSteps);
    onClose();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Set Your Step Goal</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <FontAwesome name="times" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.description, { color: colorScheme === 'dark' ? '#AAA' : '#666' }]}>
              Set your daily step goal (maximum 10,000 steps)
            </Text>
            
            <View style={[styles.inputContainer, { borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={stepGoal}
                onChangeText={setStepGoal}
                keyboardType="number-pad"
                maxLength={5}
                placeholder="Enter step goal"
                placeholderTextColor="#999"
              />
              <Text style={[styles.inputLabel, { color: colors.text }]}>steps</Text>
            </View>
            
            <View style={styles.quoteContainer}>
              <FontAwesome name="quote-left" size={16} color={colors.primary} style={styles.quoteIcon} />
              <Text style={[styles.quote, { color: colorScheme === 'dark' ? '#AAA' : '#666' }]}>
                {quote}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 18,
  },
  inputLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  quoteContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  quoteIcon: {
    marginRight: 8,
    marginTop: 4,
  },
  quote: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  saveButton: {
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StepGoalModal;
