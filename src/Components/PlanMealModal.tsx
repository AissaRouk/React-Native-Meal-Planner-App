// src/Components/PlanMealModal.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {DaysOfWeek, MealType, Recipe, WeeklyMeal} from '../Types/Types';
import {ModalHeader} from './ModalHeareComponent';
import {CustomPicker} from './CustomPicker'; // you already have this for picking enums
import {
  modalBorderRadius,
  modalSemiTransparentBg,
  modalWhiteBg,
} from '../Utils/Styiling';
import {useAppContext} from '../Context/Context';

type PlanMealModalProps = {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void; // callback to re‐fetch MainScreen data after saving
  initialDay?: DaysOfWeek;
  initialMealType?: MealType;
  initialRecipeId?: string;
};

/**
 * PlanMealModal allows the user to:
 *   1) Pick a DayOfWeek,
 *   2) Pick a MealType,
 *   3) Pick one Recipe from the entire recipe list,
 * then “Save” inserts a WeeklyMeal row.
 */
export const PlanMealModal: React.FC<PlanMealModalProps> = ({
  visible,
  onClose,
  onSaved,
  initialDay,
  initialMealType,
  initialRecipeId,
}) => {
  // 1) We need a list of ALL recipes (so the user can choose which one to plan)
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(true);

  // 2) Two pickers for DayOfWeek and MealType
  const [selectedDay, setSelectedDay] = useState<DaysOfWeek>(DaysOfWeek.MONDAY);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    MealType.BREAKFAST,
  );

  // States to manage the visibility of both pickers
  const [dayPickerVisible, setDayPickerVisible] = useState<boolean>(false);
  const [mealTypePickerVisible, setMealTypePickerVisible] =
    useState<boolean>(false);

  // 3) Pick a recipeId
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  // 4) Prevent double‐submission
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // context functions
  const {getAllRecipes, addWeeklyMeal} = useAppContext();

  // Load all recipes once when modal opens
  useEffect(() => {
    if (!visible) return;
    // reset to the incoming “initial…” or defaults
    setSelectedDay(initialDay ?? DaysOfWeek.MONDAY);
    setSelectedMealType(initialMealType ?? MealType.BREAKFAST);
    setSelectedRecipeId(initialRecipeId ?? null);
    console.log('selectedRecipeId -> ' + initialRecipeId);
    const fetchAll = async () => {
      setIsLoadingRecipes(true);
      try {
        const fetched: Recipe[] = await getAllRecipes();
        setAllRecipes(fetched);
        if (fetched.length > 0 && initialRecipeId == null) {
          // default to first recipe
          setSelectedRecipeId(fetched[0].id);
        }
      } catch (e) {
        console.error('PlanMealModal: error loading recipes:', e);
      } finally {
        setIsLoadingRecipes(false);
      }
    };
    fetchAll();
  }, [visible, initialDay, initialMealType, initialRecipeId]);

  // Called when user taps “Save”
  const handleSave = async () => {
    if (selectedRecipeId === null) {
      Alert.alert('Please select a recipe.');
      return;
    }
    setIsSaving(true);
    try {
      // Call your service to INSERT into WeeklyMeals table
      await addWeeklyMeal({
        day: selectedDay,
        mealType: selectedMealType,
        recipeId: selectedRecipeId,
      });
      // onSaved will cause MainScreen to re‐fetch from DB
      onSaved && onSaved();
      // close modal
      onClose();
    } catch (error) {
      console.error('PlanMealModal -> save error:', error);
      Alert.alert('Could not save the meal plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ModalHeader text="Plan a Meal" onClose={onClose} />

          {/** 1) Picker for DayOfWeek */}
          <Text style={styles.label}>Day of Week:</Text>
          <CustomPicker
            isPickerOpen={dayPickerVisible}
            setIsPickerOpen={setDayPickerVisible}
            quantityType={selectedDay as any}
            setQuantityType={(d: any) => setSelectedDay(d)}
            options={Object.values(DaysOfWeek)}
          />

          {/** 2) Picker for MealType */}
          <Text style={[styles.label, {marginTop: 16}]}>Meal Type:</Text>
          <CustomPicker
            isPickerOpen={mealTypePickerVisible}
            setIsPickerOpen={setMealTypePickerVisible}
            quantityType={selectedMealType as any}
            setQuantityType={(m: any) => setSelectedMealType(m)}
            options={Object.values(MealType)}
          />

          {/** 3) Scrollable list of recipes for user to choose from */}
          <Text style={[styles.label, {marginTop: 16}]}>Recipes:</Text>
          <View style={styles.recipesListContainer}>
            {isLoadingRecipes ? (
              <ActivityIndicator size="small" color="#fb7945" />
            ) : allRecipes.length === 0 ? (
              <Text style={styles.noRecipesText}>No recipes available.</Text>
            ) : (
              <ScrollView style={styles.scrollArea}>
                {allRecipes.map(r => {
                  const isSelected = r.id === selectedRecipeId;
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[
                        styles.recipeOption,
                        isSelected && styles.recipeOptionSelected,
                      ]}
                      onPress={() => setSelectedRecipeId(r.id)}>
                      <Text
                        style={[
                          styles.recipeOptionText,
                          isSelected && styles.recipeOptionTextSelected,
                        ]}>
                        {r.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/** 4) Save button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && {opacity: 0.6}]}
            onPress={handleSave}
            disabled={isSaving}>
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save to Plan'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: modalSemiTransparentBg,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: modalWhiteBg,
    borderRadius: modalBorderRadius,
    padding: 16,
    maxHeight: '90%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recipesListContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    height: 200,
    overflow: 'hidden',
  },
  noRecipesText: {
    padding: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  scrollArea: {
    paddingHorizontal: 8,
  },
  recipeOption: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recipeOptionSelected: {
    backgroundColor: '#fb7945',
    borderRadius: 4,
  },
  recipeOptionText: {
    color: '#333',
    fontSize: 16,
  },
  recipeOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#fb7945',
    marginTop: 20,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
