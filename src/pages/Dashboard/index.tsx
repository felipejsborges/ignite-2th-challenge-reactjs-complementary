import { useCallback, useEffect, useState } from 'react';

import { Header } from '../../components/Header';
import api from '../../services/api';
import { Food, IFood } from '../../components/Food';
import { ModalAddFood } from '../../components/ModalAddFood';
import { ModalEditFood } from '../../components/ModalEditFood';
import { Container, FoodsContainer } from './styles';

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingFood, setEditingFood] = useState<IFood>({} as IFood)
  const [foods, setFoods] = useState<IFood[]>([])

  const handleAddFood = useCallback(async food => {
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      setFoods([...foods, response.data]);
    } catch (err) {
      console.log(err);
    }
  }, [foods])

  const handleUpdateFood = useCallback(async food => {
    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setFoods(foodsUpdated);
    } catch (err) {
      console.log(err);
    }
  }, [editingFood, foods])

  const handleDeleteFood = useCallback(async id => {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setFoods(foodsFiltered);
  }, [foods])

  const toggleModal = useCallback(() => {
    setModalOpen(!modalOpen);
  }, [modalOpen])

  const toggleEditModal = useCallback(() => {
    setEditModalOpen(!editModalOpen);
  }, [editModalOpen])

  const handleEditFood = useCallback(food => {
    setEditingFood(food)
    setEditModalOpen(true)
  }, [])

  const getFoods = useCallback(async () => {
    const response = await api.get('/foods');

    setFoods(response.data)
  }, [])

  useEffect(() => {
    getFoods()

    return () => {
      setFoods([])
    }
  }, []) // eslint-disable-line

  return (
    <Container>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </Container>
  );
}
