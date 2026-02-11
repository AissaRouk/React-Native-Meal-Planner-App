import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import {
  DaysOfWeek,
  MealType,
  Recipe,
  QuantityType,
  quantityTypes,
  WeeklyEntryType,
} from '../Types/Types';
import {ModalHeader} from './ModalHeareComponent';
import {CustomPicker} from './CustomPicker';
import {
  modalBorderRadius,
  modalSemiTransparentBg,
  modalWhiteBg,
  orangeBackgroundColor,
} from '../Utils/Styiling';
import {useAppContext} from '../Context/Context';
import AddIngredientButton from './AddIngredientButton';
import auth from '@react-native-firebase/auth';

export type PlanMealModalProps = {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
  initialDay?: DaysOfWeek;
  initialMealType?: MealType;
  initialRecipeId?: string;
  setAddIngredientModalVisible: Dispatch<SetStateAction<boolean>>;
};

export const PlanMealModal: React.FC<PlanMealModalProps> = ({
  visible,
  onClose,
  onSaved,
  initialDay,
  initialMealType,
  initialRecipeId,
  setAddIngredientModalVisible,
}) => {
  // selection values
  const [selectedDay, setSelectedDay] = useState<DaysOfWeek>(
    initialDay ?? DaysOfWeek.MONDAY,
  );
  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    initialMealType ?? MealType.BREAKFAST,
  );

  // picker open/close state (the crucial bit)
  const [dayPickerOpen, setDayPickerOpen] = useState(false);
  const [mealPickerOpen, setMealPickerOpen] = useState(false);
  const [qtyPickerOpen, setQtyPickerOpen] = useState(false);

  const [isRecipe, setIsRecipe] = useState(false);

  // recipes
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(true);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(
    initialRecipeId ?? null,
  );

  // ingredients
  const {ingredients, getAllRecipes, addWeeklyMeal} = useAppContext();
  const [search, setSearch] = useState('');
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
  const [qtyText, setQtyText] = useState('1');
  const [qtyType, setQtyType] = useState<QuantityType>(QuantityType.UNIT);

  const [isSaving, setIsSaving] = useState(false);

  const user = auth().currentUser;
  if (!user) throw new Error('No user logged in');

  useEffect(() => {
    if (!visible) return;

    setSelectedDay(initialDay ?? DaysOfWeek.MONDAY);
    setSelectedMealType(initialMealType ?? MealType.BREAKFAST);
    setSelectedRecipeId(initialRecipeId ?? null);
    setIsRecipe(initialRecipeId != null); // open on Recipes only if a recipe was passed

    // reset pickers closed on open
    setDayPickerOpen(false);
    setMealPickerOpen(false);
    setQtyPickerOpen(false);

    // load recipes
    const fetchAll = async () => {
      setIsLoadingRecipes(true);
      try {
        const fetched: Recipe[] = await getAllRecipes(user.uid);
        setAllRecipes(fetched);
        if (!initialRecipeId && fetched.length > 0)
          setSelectedRecipeId(fetched[0].id);
      } catch (e) {
        console.error('PlanMealModal: error loading recipes:', e);
      } finally {
        setIsLoadingRecipes(false);
      }
    };
    fetchAll();

    // reset ingredient form
    setSearch('');
    setSelectedIngredientId('');
    setQtyText('1');
    setQtyType(QuantityType.UNIT);
  }, [visible, initialDay, initialMealType, initialRecipeId, getAllRecipes]);

  const filteredIngredients = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return ingredients;
    return ingredients.filter(i => (i.name ?? '').toLowerCase().includes(s));
  }, [ingredients, search]);

  const validateAndSave = async () => {
    try {
      if (isRecipe) {
        if (!selectedRecipeId) {
          Alert.alert('Please select a recipe.');
          return;
        }
        setIsSaving(true);
        await addWeeklyMeal({
          day: selectedDay,
          mealType: selectedMealType,
          recipeId: selectedRecipeId,
          entryType: WeeklyEntryType.RECIPE,
          userId: user.uid,
        } as any);
      } else {
        if (!selectedIngredientId) {
          Alert.alert('Please select an ingredient.');
          return;
        }
        const q = parseFloat(qtyText);
        if (isNaN(q) || q <= 0) {
          Alert.alert('Quantity must be a positive number.');
          return;
        }
        setIsSaving(true);
        await addWeeklyMeal({
          day: selectedDay,
          mealType: selectedMealType,
          ingredientId: selectedIngredientId,
          quantity: q,
          quantityType: qtyType,
          entryType: WeeklyEntryType.INGREDIENT,
          userId: user.uid,
        } as any);
      }

      onSaved?.();
      onClose();
    } catch (error) {
      console.error('PlanMealModal -> save error:', error);
      Alert.alert('Could not save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ModalHeader text="Plan a Meal" onClose={onClose} />

          {/* Day */}
          <Text style={styles.label}>Day of Week</Text>
          <CustomPicker
            isPickerOpen={dayPickerOpen}
            setIsPickerOpen={setDayPickerOpen}
            quantityType={selectedDay as any}
            setQuantityType={(d: any) => setSelectedDay(d)}
            options={Object.values(DaysOfWeek)}
          />

          {/* Meal type */}
          <Text style={[styles.label, {marginTop: 16}]}>Meal Type</Text>
          <CustomPicker
            isPickerOpen={mealPickerOpen}
            setIsPickerOpen={setMealPickerOpen}
            quantityType={selectedMealType as any}
            setQuantityType={(m: any) => setSelectedMealType(m)}
            options={Object.values(MealType)}
          />

          {/* Toggle */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, isRecipe && styles.toggleBtnActive]}
              onPress={() => setIsRecipe(true)}>
              <Text
                style={[
                  styles.toggleText,
                  isRecipe && styles.toggleTextActive,
                ]}>
                Recipes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, !isRecipe && styles.toggleBtnActive]}
              onPress={() => setIsRecipe(false)}>
              <Text
                style={[
                  styles.toggleText,
                  !isRecipe && styles.toggleTextActive,
                ]}>
                Ingredients
              </Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          {isRecipe ? (
            <View style={styles.listBox}>
              {isLoadingRecipes ? (
                <ActivityIndicator size="small" color={orangeBackgroundColor} />
              ) : allRecipes.length === 0 ? (
                <Text style={styles.noData}>No recipes available.</Text>
              ) : (
                <ScrollView style={styles.scrollArea}>
                  {allRecipes.map(r => {
                    const selected = r.id === selectedRecipeId;
                    return (
                      <TouchableOpacity
                        key={r.id}
                        style={[styles.option, selected && styles.optionActive]}
                        onPress={() => setSelectedRecipeId(r.id)}>
                        <Text
                          style={[
                            styles.optionText,
                            selected && styles.optionTextActive,
                          ]}>
                          {r.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          ) : (
            <View>
              <Text style={[styles.label, {marginTop: 12}]}>
                Find ingredient
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TextInput
                  style={styles.input}
                  placeholder="Banana, muesli bar…"
                  value={search}
                  onChangeText={setSearch}
                />
                <AddIngredientButton
                  searchContainerHeight={28}
                  setAddIngredientModalVisible={setAddIngredientModalVisible}
                />
              </View>

              <View style={styles.chipsRow}>
                {filteredIngredients.slice(0, 10).map(i => {
                  const selected = i.id === selectedIngredientId;
                  return (
                    <TouchableOpacity
                      key={i.id}
                      style={[styles.chip, selected && styles.chipActive]}
                      onPress={() => setSelectedIngredientId(i.id)}>
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextActive,
                        ]}>
                        {i.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.row}>
                <View style={{flex: 1, marginRight: 8}}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={qtyText}
                    onChangeText={setQtyText}
                  />
                </View>
                <View style={{flex: 1, marginLeft: 8}}>
                  <Text style={styles.label}>Unit</Text>
                  <CustomPicker
                    isPickerOpen={qtyPickerOpen}
                    setIsPickerOpen={setQtyPickerOpen}
                    quantityType={qtyType as any}
                    setQuantityType={(qt: any) => setQtyType(qt)}
                    options={quantityTypes}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && {opacity: 0.6}]}
            onPress={validateAndSave}
            disabled={isSaving}>
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving…' : 'Save to Plan'}
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
  label: {fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8},
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: orangeBackgroundColor,
    borderColor: orangeBackgroundColor,
  },
  toggleText: {color: '#333', fontWeight: '600'},
  toggleTextActive: {color: 'white'},
  listBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    height: 200,
    overflow: 'hidden',
  },
  noData: {padding: 12, color: '#666', fontStyle: 'italic'},
  scrollArea: {paddingHorizontal: 8},
  option: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionActive: {backgroundColor: orangeBackgroundColor, borderRadius: 4},
  optionText: {color: '#333', fontSize: 16},
  optionTextActive: {color: 'white', fontWeight: '600'},
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flex: 1,
  },
  chipsRow: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 8},
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#f2f2f2',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {backgroundColor: orangeBackgroundColor},
  chipText: {color: '#333'},
  chipTextActive: {color: 'white', fontWeight: '600'},
  row: {flexDirection: 'row', marginTop: 10},
  saveButton: {
    backgroundColor: orangeBackgroundColor,
    marginTop: 20,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {color: 'white', fontSize: 18, fontWeight: '600'},
});
